#import <ApplicationServices/ApplicationServices.h>
#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>
#import <IOKit/hid/IOHIDKeys.h>
#import <IOKit/hid/IOHIDManager.h>
#include <math.h>

typedef NS_ENUM(NSInteger, ControllerRunMode) {
    ControllerRunModeInspect = 0,
    ControllerRunModeMouse = 1,
    ControllerRunModeTetris = 2,
    ControllerRunModeKeyboard = 3,
};

static NSArray *CreateMatchingDictionaries(void);
static NSString *DeviceStringProperty(IOHIDDeviceRef device, CFStringRef key);
static NSInteger DeviceIntegerProperty(IOHIDDeviceRef device, CFStringRef key, NSInteger fallback);
static NSString *UsageDescription(uint32_t usagePage, uint32_t usage);
static NSString *ElementTypeDescription(IOHIDElementType type);
static NSString *TimestampString(void);
static void PrintLine(NSString *line);
static double NormalizeAxisValue(IOHIDElementRef element, CFIndex rawValue);
static double ApplyDeadzone(double value, double deadzone);
static CGPoint CurrentCursorPosition(void);
static CGPoint ClampPointToMainDisplay(CGPoint point);
static BOOL ParseUInt32Value(NSString *text, uint32_t *value);
static BOOL ParseDoubleValue(NSString *text, double *value);
static BOOL ParseAxisUsage(NSString *text, uint32_t *usage);

@interface ControllerApp : NSObject
- (int)parseArguments:(NSArray *)arguments;
- (int)run;
- (void)handleMatchedDevice:(IOHIDDeviceRef)device;
- (void)handleRemovedDevice:(IOHIDDeviceRef)device;
- (void)handleInputValue:(IOHIDValueRef)value fromDevice:(IOHIDDeviceRef)device;
- (void)movementTick;
- (void)handleTetrisButtonUsage:(uint32_t)usage isDown:(BOOL)isDown;
- (void)releaseHeldTetrisKeys;
- (void)updateTetrisDirectionalKeys;
- (void)handleKeyboardButtonUsage:(uint32_t)usage isDown:(BOOL)isDown;
- (void)releaseHeldKeyboardKeys;
- (void)updateKeyboardDirectionalKeys;
@end

static void DeviceMatchedCallback(void *context, IOReturn result, void *sender, IOHIDDeviceRef device) {
    (void)result;
    (void)sender;
    [(__bridge ControllerApp *)context handleMatchedDevice:device];
}

static void DeviceRemovedCallback(void *context, IOReturn result, void *sender, IOHIDDeviceRef device) {
    (void)result;
    (void)sender;
    [(__bridge ControllerApp *)context handleRemovedDevice:device];
}

static void InputValueCallback(void *context, IOReturn result, void *sender, IOHIDValueRef value) {
    (void)result;
    [(__bridge ControllerApp *)context handleInputValue:value fromDevice:(IOHIDDeviceRef)sender];
}

static void MovementTimerCallback(CFRunLoopTimerRef timer, void *info) {
    (void)timer;
    [(__bridge ControllerApp *)info movementTick];
}

@implementation ControllerApp {
    ControllerRunMode _mode;
    NSString *_nameFilter;
    IOHIDManagerRef _manager;
    IOHIDDeviceRef _activeDevice;
    CFRunLoopTimerRef _movementTimer;
    NSMutableSet *_trackedDevices;
    uint32_t _xAxisUsage;
    uint32_t _yAxisUsage;
    uint32_t _leftButtonUsage;
    uint32_t _rightButtonUsage;
    uint32_t _escapeButtonUsage;
    uint32_t _returnButtonUsage;
    uint32_t _rotateCCWButtonUsage;
    uint32_t _rotateCWButtonUsage;
    uint32_t _holdButtonUsage;
    uint32_t _hardDropButtonUsage;
    uint32_t _pauseButtonUsage;
    uint32_t _restartButtonUsage;
    uint32_t _primaryButtonUsage;
    uint32_t _secondaryButtonUsage;
    double _deadzone;
    double _baseSpeed;
    double _acceleration;
    double _pollInterval;
    double _xAxisValue;
    double _yAxisValue;
    double _remainderX;
    double _remainderY;
    double _tetrisMoveThreshold;
    CFAbsoluteTime _lastMoveTick;
    CFAbsoluteTime _lastSuspendCheck;
    BOOL _leftMouseDown;
    BOOL _rightMouseDown;
    BOOL _isSuspended;
    NSInteger _hatSwitchValue;
    BOOL _leftKeyDown;
    BOOL _rightKeyDown;
    BOOL _upKeyDown;
    BOOL _downKeyDown;
    CGKeyCode _keyboardLeftKeyCode;
    CGKeyCode _keyboardRightKeyCode;
    CGKeyCode _keyboardUpKeyCode;
    CGKeyCode _keyboardDownKeyCode;
    CGKeyCode _keyboardPrimaryKeyCode;
    CGKeyCode _keyboardSecondaryKeyCode;
    CGKeyCode _keyboardPauseKeyCode;
    CGKeyCode _keyboardRestartKeyCode;
    NSMutableArray *_suspendProcessNames;
}

- (instancetype)init {
    self = [super init];
    if (!self) {
        return nil;
    }

    _mode = ControllerRunModeInspect;
    _xAxisUsage = kHIDUsage_GD_X;
    _yAxisUsage = kHIDUsage_GD_Y;
    _leftButtonUsage = 1;
    _rightButtonUsage = 2;
    _rotateCCWButtonUsage = 1;
    _rotateCWButtonUsage = 2;
    _holdButtonUsage = 4;
    _hardDropButtonUsage = 3;
    _pauseButtonUsage = 10;
    _restartButtonUsage = 9;
    _primaryButtonUsage = 1;
    _secondaryButtonUsage = 2;
    _deadzone = 0.18;
    _baseSpeed = 9.0;
    _acceleration = 13.0;
    _tetrisMoveThreshold = 0.42;
    _pollInterval = 1.0 / 60.0;
    _hatSwitchValue = -1;
    _keyboardLeftKeyCode = 123;
    _keyboardRightKeyCode = 124;
    _keyboardUpKeyCode = 126;
    _keyboardDownKeyCode = 125;
    _keyboardPrimaryKeyCode = 49;
    _keyboardSecondaryKeyCode = 36;
    _keyboardPauseKeyCode = 35;
    _keyboardRestartKeyCode = 15;
    _suspendProcessNames = [NSMutableArray arrayWithObjects:@"sixtyforce", @"OpenEmu", nil];
    _trackedDevices = [NSMutableSet set];
    return self;
}

- (void)dealloc {
    if (_movementTimer) {
        CFRunLoopTimerInvalidate(_movementTimer);
        CFRelease(_movementTimer);
    }
    if (_activeDevice) {
        CFRelease(_activeDevice);
    }
    if (_manager) {
        IOHIDManagerUnscheduleFromRunLoop(_manager, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);
        IOHIDManagerClose(_manager, kIOHIDOptionsTypeNone);
        CFRelease(_manager);
    }
}

- (int)parseArguments:(NSArray *)arguments {
    NSUInteger index = 1;
    while (index < [arguments count]) {
        NSString *argument = [arguments objectAtIndex:index];

        if ([argument isEqualToString:@"--help"] || [argument isEqualToString:@"-h"]) {
            PrintLine(@"Usage:");
            PrintLine(@"  controller-mouse --list");
            PrintLine(@"  controller-mouse --inspect [--name \"Pro Controller\"]");
            PrintLine(@"  controller-mouse --mouse [--name \"Pro Controller\"] [--left-button 1] [--right-button 2]");
            PrintLine(@"  controller-mouse --tetris [--name \"8BitDo\"]");
            PrintLine(@"  controller-mouse --keyboard [--name \"8BitDo\"]");
            PrintLine(@"");
            PrintLine(@"Options:");
            PrintLine(@"  --list                  List connected joystick/gamepad HID devices and exit.");
            PrintLine(@"  --inspect               Print live axis/button events without moving the mouse.");
            PrintLine(@"  --mouse                 Enable pointer movement and mouse clicks.");
            PrintLine(@"  --tetris                Convert controller input into keyboard events for Tetris.");
            PrintLine(@"  --keyboard              Convert controller input into configurable keyboard events.");
            PrintLine(@"  --name <substring>      Only track devices whose name contains the text.");
            PrintLine(@"  --x-axis <name|usage>   Axis for horizontal motion: x, y, z, rx, ry, rz, slider, dial, wheel.");
            PrintLine(@"  --y-axis <name|usage>   Axis for vertical motion: x, y, z, rx, ry, rz, slider, dial, wheel.");
            PrintLine(@"  --left-button <usage>   HID button usage for left click. Default: 1.");
            PrintLine(@"  --right-button <usage>  HID button usage for right click. Default: 2.");
            PrintLine(@"  --rotate-ccw-button <u> Tetris rotate-CCW button. Default: 1.");
            PrintLine(@"  --rotate-cw-button <u>  Tetris rotate-CW button. Default: 2.");
            PrintLine(@"  --hold-button <u>       Tetris hold button. Default: 4.");
            PrintLine(@"  --drop-button <u>       Tetris hard-drop button. Default: 3.");
            PrintLine(@"  --pause-button <u>      Tetris pause button. Default: 10.");
            PrintLine(@"  --restart-button <u>    Tetris restart button. Default: 9.");
            PrintLine(@"  --primary-button <u>    Keyboard mode primary action button. Default: 1.");
            PrintLine(@"  --secondary-button <u>  Keyboard mode secondary action button. Default: 2.");
            PrintLine(@"  --left-key <code>       Keyboard mode left keycode. Default: 123 (Left Arrow).");
            PrintLine(@"  --right-key <code>      Keyboard mode right keycode. Default: 124 (Right Arrow).");
            PrintLine(@"  --up-key <code>         Keyboard mode up keycode. Default: 126 (Up Arrow).");
            PrintLine(@"  --down-key <code>       Keyboard mode down keycode. Default: 125 (Down Arrow).");
            PrintLine(@"  --primary-key <code>    Keyboard mode primary tap key. Default: 49 (Space).");
            PrintLine(@"  --secondary-key <code>  Keyboard mode secondary tap key. Default: 36 (Return).");
            PrintLine(@"  --pause-key <code>      Keyboard mode pause tap key. Default: 35 (P).");
            PrintLine(@"  --restart-key <code>    Keyboard mode restart tap key. Default: 15 (R).");
            PrintLine(@"  --escape-button <usage> Optional HID button usage that posts Escape.");
            PrintLine(@"  --return-button <usage> Optional HID button usage that posts Return.");
            PrintLine(@"  --deadzone <value>      Analog deadzone between 0.0 and 0.95. Default: 0.18.");
            PrintLine(@"  --move-threshold <val>  Tetris stick threshold between 0.0 and 0.95. Default: 0.42.");
            PrintLine(@"  --speed <value>         Base cursor speed. Default: 9.0.");
            PrintLine(@"  --acceleration <value>  Extra speed added on large stick tilt. Default: 13.0.");
            PrintLine(@"  --poll-interval <sec>   Mouse update interval in seconds. Default: 0.0167.");
            PrintLine(@"  --suspend-process <id>  Suspend mouse mapping while a process/app name is running. Repeatable.");
            PrintLine(@"");
            PrintLine(@"Examples:");
            PrintLine(@"  controller-mouse --list");
            PrintLine(@"  controller-mouse --inspect --name \"Pro Controller\"");
            PrintLine(@"  controller-mouse --mouse --name \"Pro Controller\" --left-button 3 --right-button 2 --return-button 13");
            PrintLine(@"  controller-mouse --tetris --name \"8BitDo\"");
            PrintLine(@"  controller-mouse --keyboard --name \"8BitDo\" --left-key 123 --right-key 124 --primary-key 49");
            PrintLine(@"");
            PrintLine(@"Default suspended process names: sixtyforce, OpenEmu");
            return 1;
        }

        if ([argument isEqualToString:@"--list"]) {
            _mode = ControllerRunModeInspect;
            _pollInterval = 0;
            index += 1;
            continue;
        }

        if ([argument isEqualToString:@"--inspect"]) {
            _mode = ControllerRunModeInspect;
            index += 1;
            continue;
        }

        if ([argument isEqualToString:@"--mouse"]) {
            _mode = ControllerRunModeMouse;
            index += 1;
            continue;
        }

        if ([argument isEqualToString:@"--tetris"]) {
            _mode = ControllerRunModeTetris;
            index += 1;
            continue;
        }

        if ([argument isEqualToString:@"--keyboard"]) {
            _mode = ControllerRunModeKeyboard;
            index += 1;
            continue;
        }

        if (index + 1 >= [arguments count]) {
            PrintLine([NSString stringWithFormat:@"Missing value for %@", argument]);
            return 2;
        }

        NSString *value = [arguments objectAtIndex:index + 1];

        if ([argument isEqualToString:@"--name"]) {
            _nameFilter = [value copy];
        } else if ([argument isEqualToString:@"--x-axis"]) {
            if (!ParseAxisUsage(value, &_xAxisUsage)) {
                PrintLine([NSString stringWithFormat:@"Unsupported axis value for --x-axis: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--y-axis"]) {
            if (!ParseAxisUsage(value, &_yAxisUsage)) {
                PrintLine([NSString stringWithFormat:@"Unsupported axis value for --y-axis: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--left-button"]) {
            if (!ParseUInt32Value(value, &_leftButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --left-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--right-button"]) {
            if (!ParseUInt32Value(value, &_rightButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --right-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--rotate-ccw-button"]) {
            if (!ParseUInt32Value(value, &_rotateCCWButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --rotate-ccw-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--rotate-cw-button"]) {
            if (!ParseUInt32Value(value, &_rotateCWButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --rotate-cw-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--hold-button"]) {
            if (!ParseUInt32Value(value, &_holdButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --hold-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--drop-button"]) {
            if (!ParseUInt32Value(value, &_hardDropButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --drop-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--pause-button"]) {
            if (!ParseUInt32Value(value, &_pauseButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --pause-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--restart-button"]) {
            if (!ParseUInt32Value(value, &_restartButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --restart-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--primary-button"]) {
            if (!ParseUInt32Value(value, &_primaryButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --primary-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--secondary-button"]) {
            if (!ParseUInt32Value(value, &_secondaryButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --secondary-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--left-key"]) {
            uint32_t parsed = 0;
            if (!ParseUInt32Value(value, &parsed)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --left-key: %@", value]);
                return 2;
            }
            _keyboardLeftKeyCode = (CGKeyCode)parsed;
        } else if ([argument isEqualToString:@"--right-key"]) {
            uint32_t parsed = 0;
            if (!ParseUInt32Value(value, &parsed)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --right-key: %@", value]);
                return 2;
            }
            _keyboardRightKeyCode = (CGKeyCode)parsed;
        } else if ([argument isEqualToString:@"--up-key"]) {
            uint32_t parsed = 0;
            if (!ParseUInt32Value(value, &parsed)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --up-key: %@", value]);
                return 2;
            }
            _keyboardUpKeyCode = (CGKeyCode)parsed;
        } else if ([argument isEqualToString:@"--down-key"]) {
            uint32_t parsed = 0;
            if (!ParseUInt32Value(value, &parsed)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --down-key: %@", value]);
                return 2;
            }
            _keyboardDownKeyCode = (CGKeyCode)parsed;
        } else if ([argument isEqualToString:@"--primary-key"]) {
            uint32_t parsed = 0;
            if (!ParseUInt32Value(value, &parsed)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --primary-key: %@", value]);
                return 2;
            }
            _keyboardPrimaryKeyCode = (CGKeyCode)parsed;
        } else if ([argument isEqualToString:@"--secondary-key"]) {
            uint32_t parsed = 0;
            if (!ParseUInt32Value(value, &parsed)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --secondary-key: %@", value]);
                return 2;
            }
            _keyboardSecondaryKeyCode = (CGKeyCode)parsed;
        } else if ([argument isEqualToString:@"--pause-key"]) {
            uint32_t parsed = 0;
            if (!ParseUInt32Value(value, &parsed)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --pause-key: %@", value]);
                return 2;
            }
            _keyboardPauseKeyCode = (CGKeyCode)parsed;
        } else if ([argument isEqualToString:@"--restart-key"]) {
            uint32_t parsed = 0;
            if (!ParseUInt32Value(value, &parsed)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --restart-key: %@", value]);
                return 2;
            }
            _keyboardRestartKeyCode = (CGKeyCode)parsed;
        } else if ([argument isEqualToString:@"--escape-button"]) {
            if (!ParseUInt32Value(value, &_escapeButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --escape-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--return-button"]) {
            if (!ParseUInt32Value(value, &_returnButtonUsage)) {
                PrintLine([NSString stringWithFormat:@"Invalid integer for --return-button: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--deadzone"]) {
            if (!ParseDoubleValue(value, &_deadzone) || _deadzone < 0.0 || _deadzone >= 1.0) {
                PrintLine([NSString stringWithFormat:@"Deadzone must be between 0.0 and 0.99: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--move-threshold"]) {
            if (!ParseDoubleValue(value, &_tetrisMoveThreshold) || _tetrisMoveThreshold < 0.0 || _tetrisMoveThreshold >= 1.0) {
                PrintLine([NSString stringWithFormat:@"Move threshold must be between 0.0 and 0.99: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--speed"]) {
            if (!ParseDoubleValue(value, &_baseSpeed) || _baseSpeed < 0.0) {
                PrintLine([NSString stringWithFormat:@"Speed must be non-negative: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--acceleration"]) {
            if (!ParseDoubleValue(value, &_acceleration) || _acceleration < 0.0) {
                PrintLine([NSString stringWithFormat:@"Acceleration must be non-negative: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--poll-interval"]) {
            if (!ParseDoubleValue(value, &_pollInterval) || _pollInterval <= 0.0) {
                PrintLine([NSString stringWithFormat:@"Poll interval must be positive: %@", value]);
                return 2;
            }
        } else if ([argument isEqualToString:@"--suspend-process"]) {
            if ([value length] > 0) {
                [_suspendProcessNames addObject:[value copy]];
            }
        } else {
            PrintLine([NSString stringWithFormat:@"Unknown option: %@", argument]);
            return 2;
        }

        index += 2;
    }

    return 0;
}

- (int)run {
    if (_pollInterval == 0) {
        return [self listDevices];
    }

    return [self monitorDevices];
}

- (int)listDevices {
    IOHIDManagerRef manager = IOHIDManagerCreate(kCFAllocatorDefault, kIOHIDOptionsTypeNone);
    if (!manager) {
        PrintLine(@"Unable to create IOHIDManager.");
        return 1;
    }

    IOHIDManagerSetDeviceMatchingMultiple(manager, (__bridge CFArrayRef)CreateMatchingDictionaries());
    IOReturn openResult = IOHIDManagerOpen(manager, kIOHIDOptionsTypeNone);
    if (openResult != kIOReturnSuccess) {
        PrintLine([NSString stringWithFormat:@"Unable to open IOHIDManager: 0x%08x", openResult]);
        CFRelease(manager);
        return 1;
    }

    CFSetRef deviceSet = IOHIDManagerCopyDevices(manager);
    if (!deviceSet) {
        PrintLine(@"No joystick/gamepad HID devices found.");
        IOHIDManagerClose(manager, kIOHIDOptionsTypeNone);
        CFRelease(manager);
        return _nameFilter.length > 0 ? 1 : 0;
    }

    NSArray *devices = [(__bridge NSSet *)deviceSet allObjects];
    devices = [devices sortedArrayUsingComparator:^NSComparisonResult(id left, id right) {
        NSString *leftName = DeviceStringProperty((__bridge IOHIDDeviceRef)left, CFSTR(kIOHIDProductKey));
        NSString *rightName = DeviceStringProperty((__bridge IOHIDDeviceRef)right, CFSTR(kIOHIDProductKey));
        return [leftName compare:rightName options:NSCaseInsensitiveSearch];
    }];

    NSInteger shown = 0;
    for (id entry in devices) {
        IOHIDDeviceRef device = (__bridge IOHIDDeviceRef)entry;
        if (![self deviceMatchesFilter:device]) {
            continue;
        }
        shown += 1;
        PrintLine([self deviceSummaryForDevice:device prefix:[NSString stringWithFormat:@"[%ld]", (long)shown]]);
    }

    if (shown == 0) {
        if (_nameFilter.length > 0) {
            PrintLine([NSString stringWithFormat:@"No joystick/gamepad devices matched \"%@\".", _nameFilter]);
        } else {
            PrintLine(@"No joystick/gamepad HID devices found.");
        }
    }

    CFRelease(deviceSet);
    IOHIDManagerClose(manager, kIOHIDOptionsTypeNone);
    CFRelease(manager);
    return shown == 0 && _nameFilter.length > 0 ? 1 : 0;
}

- (int)monitorDevices {
    _manager = IOHIDManagerCreate(kCFAllocatorDefault, kIOHIDOptionsTypeNone);
    if (!_manager) {
        PrintLine(@"Unable to create IOHIDManager.");
        return 1;
    }

    IOHIDManagerSetDeviceMatchingMultiple(_manager, (__bridge CFArrayRef)CreateMatchingDictionaries());
    IOHIDManagerRegisterDeviceMatchingCallback(_manager, DeviceMatchedCallback, (__bridge void *)self);
    IOHIDManagerRegisterDeviceRemovalCallback(_manager, DeviceRemovedCallback, (__bridge void *)self);
    IOHIDManagerScheduleWithRunLoop(_manager, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);

    IOReturn openResult = IOHIDManagerOpen(_manager, kIOHIDOptionsTypeNone);
    if (openResult != kIOReturnSuccess) {
        PrintLine([NSString stringWithFormat:@"Unable to open IOHIDManager: 0x%08x", openResult]);
        return 1;
    }

    if (_mode == ControllerRunModeMouse || _mode == ControllerRunModeTetris || _mode == ControllerRunModeKeyboard) {
        CFRunLoopTimerContext timerContext = {0, (__bridge void *)self, NULL, NULL, NULL};
        _movementTimer = CFRunLoopTimerCreate(
            kCFAllocatorDefault,
            CFAbsoluteTimeGetCurrent() + _pollInterval,
            _pollInterval,
            0,
            0,
            MovementTimerCallback,
            &timerContext
        );
        CFRunLoopAddTimer(CFRunLoopGetCurrent(), _movementTimer, kCFRunLoopDefaultMode);

        if (_mode == ControllerRunModeMouse) {
            PrintLine([NSString stringWithFormat:
                       @"Mouse mode enabled. x=%@ y=%@ left=Button %u right=Button %u deadzone=%.2f speed=%.1f acceleration=%.1f",
                       UsageDescription(kHIDPage_GenericDesktop, _xAxisUsage),
                       UsageDescription(kHIDPage_GenericDesktop, _yAxisUsage),
                       _leftButtonUsage,
                       _rightButtonUsage,
                       _deadzone,
                       _baseSpeed,
                       _acceleration]);
            if (_escapeButtonUsage > 0) {
                PrintLine([NSString stringWithFormat:@"Escape mapped to Button %u", _escapeButtonUsage]);
            }
            if (_returnButtonUsage > 0) {
                PrintLine([NSString stringWithFormat:@"Return mapped to Button %u", _returnButtonUsage]);
            }
            if ([_suspendProcessNames count] > 0) {
                PrintLine([NSString stringWithFormat:@"Mouse mapping will suspend while these processes are running: %@",
                           [_suspendProcessNames componentsJoinedByString:@", "]]);
            }
        } else {
            if (_mode == ControllerRunModeTetris) {
                PrintLine([NSString stringWithFormat:
                           @"Tetris mode enabled. x=%@ y=%@ threshold=%.2f ccw=Button %u cw=Button %u hold=Button %u drop=Button %u pause=Button %u restart=Button %u",
                           UsageDescription(kHIDPage_GenericDesktop, _xAxisUsage),
                           UsageDescription(kHIDPage_GenericDesktop, _yAxisUsage),
                           _tetrisMoveThreshold,
                           _rotateCCWButtonUsage,
                           _rotateCWButtonUsage,
                           _holdButtonUsage,
                           _hardDropButtonUsage,
                           _pauseButtonUsage,
                           _restartButtonUsage]);
            } else {
                PrintLine([NSString stringWithFormat:
                           @"Keyboard mode enabled. x=%@ y=%@ threshold=%.2f primary=Button %u secondary=Button %u pause=Button %u restart=Button %u",
                           UsageDescription(kHIDPage_GenericDesktop, _xAxisUsage),
                           UsageDescription(kHIDPage_GenericDesktop, _yAxisUsage),
                           _tetrisMoveThreshold,
                           _primaryButtonUsage,
                           _secondaryButtonUsage,
                           _pauseButtonUsage,
                           _restartButtonUsage]);
            }
        }
    } else {
        PrintLine(@"Inspect mode enabled. Printing live HID events only.");
    }

    if (_nameFilter.length > 0) {
        PrintLine([NSString stringWithFormat:@"Waiting for HID device matching \"%@\"...", _nameFilter]);
    } else {
        PrintLine(@"Waiting for joystick/gamepad HID device...");
    }

    CFSetRef existingDevices = IOHIDManagerCopyDevices(_manager);
    if (existingDevices) {
        for (id entry in [(__bridge NSSet *)existingDevices allObjects]) {
            [self handleMatchedDevice:(__bridge IOHIDDeviceRef)entry];
        }
        CFRelease(existingDevices);
    }

    CFRunLoopRun();
    return 0;
}

- (BOOL)deviceMatchesFilter:(IOHIDDeviceRef)device {
    if (_nameFilter.length == 0) {
        return YES;
    }

    NSString *product = DeviceStringProperty(device, CFSTR(kIOHIDProductKey));
    NSString *manufacturer = DeviceStringProperty(device, CFSTR(kIOHIDManufacturerKey));
    NSString *fullName = [NSString stringWithFormat:@"%@ %@", manufacturer, product];
    return [fullName rangeOfString:_nameFilter options:NSCaseInsensitiveSearch].location != NSNotFound;
}

- (NSString *)deviceSummaryForDevice:(IOHIDDeviceRef)device prefix:(NSString *)prefix {
    NSString *manufacturer = DeviceStringProperty(device, CFSTR(kIOHIDManufacturerKey));
    NSString *product = DeviceStringProperty(device, CFSTR(kIOHIDProductKey));
    NSString *transport = DeviceStringProperty(device, CFSTR(kIOHIDTransportKey));
    NSString *serial = DeviceStringProperty(device, CFSTR(kIOHIDSerialNumberKey));
    NSInteger vendorID = DeviceIntegerProperty(device, CFSTR(kIOHIDVendorIDKey), -1);
    NSInteger productID = DeviceIntegerProperty(device, CFSTR(kIOHIDProductIDKey), -1);
    NSInteger usagePage = DeviceIntegerProperty(device, CFSTR(kIOHIDPrimaryUsagePageKey), 0);
    NSInteger usage = DeviceIntegerProperty(device, CFSTR(kIOHIDPrimaryUsageKey), 0);

    NSMutableArray *parts = [NSMutableArray array];
    [parts addObject:[NSString stringWithFormat:@"%@ %@%@", manufacturer.length ? manufacturer : @"Unknown maker", product.length ? product : @"Unknown product", serial.length ? [NSString stringWithFormat:@" (%@)", serial] : @""]];
    if (transport.length > 0) {
        [parts addObject:[NSString stringWithFormat:@"transport=%@", transport]];
    }
    if (vendorID >= 0 && productID >= 0) {
        [parts addObject:[NSString stringWithFormat:@"vid=0x%04lx pid=0x%04lx", (long)vendorID, (long)productID]];
    }
    [parts addObject:[NSString stringWithFormat:@"usage=%@", UsageDescription((uint32_t)usagePage, (uint32_t)usage)]];
    return [NSString stringWithFormat:@"%@ %@", prefix, [parts componentsJoinedByString:@" | "]];
}

- (void)handleMatchedDevice:(IOHIDDeviceRef)device {
    if (![self deviceMatchesFilter:device]) {
        return;
    }

    NSValue *deviceKey = [NSValue valueWithPointer:device];
    if ([_trackedDevices containsObject:deviceKey]) {
        return;
    }
    [_trackedDevices addObject:deviceKey];

    IOHIDDeviceRegisterInputValueCallback(device, InputValueCallback, (__bridge void *)self);
    IOHIDDeviceScheduleWithRunLoop(device, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);

    IOReturn openResult = IOHIDDeviceOpen(device, kIOHIDOptionsTypeNone);
    if (openResult != kIOReturnSuccess) {
        [_trackedDevices removeObject:deviceKey];
        PrintLine([NSString stringWithFormat:@"Unable to open device %@: 0x%08x", DeviceStringProperty(device, CFSTR(kIOHIDProductKey)), openResult]);
        return;
    }

    PrintLine([NSString stringWithFormat:@"%@ attached %@", TimestampString(), [self deviceSummaryForDevice:device prefix:@"[device]"]]);
    [self printControlSummaryForDevice:device];

    if (!_activeDevice) {
        _activeDevice = device;
        CFRetain(_activeDevice);
        PrintLine([NSString stringWithFormat:@"%@ using %@ for live input", TimestampString(), DeviceStringProperty(device, CFSTR(kIOHIDProductKey))]);
    }
}

- (void)handleRemovedDevice:(IOHIDDeviceRef)device {
    if (![self deviceMatchesFilter:device]) {
        return;
    }

    [_trackedDevices removeObject:[NSValue valueWithPointer:device]];
    PrintLine([NSString stringWithFormat:@"%@ removed %@", TimestampString(), DeviceStringProperty(device, CFSTR(kIOHIDProductKey))]);

    if (_activeDevice == device) {
        [self releaseHeldButtons];
        [self releaseHeldTetrisKeys];
        [self releaseHeldKeyboardKeys];
        _xAxisValue = 0;
        _yAxisValue = 0;
        _hatSwitchValue = -1;
        _remainderX = 0;
        _remainderY = 0;
        CFRelease(_activeDevice);
        _activeDevice = NULL;
        _lastMoveTick = 0;
        PrintLine([NSString stringWithFormat:@"%@ waiting for controller reconnection", TimestampString()]);
    }
}

- (void)handleInputValue:(IOHIDValueRef)value fromDevice:(IOHIDDeviceRef)device {
    IOHIDElementRef element = IOHIDValueGetElement(value);
    if (!element) {
        return;
    }

    uint32_t usagePage = IOHIDElementGetUsagePage(element);
    uint32_t usage = IOHIDElementGetUsage(element);
    CFIndex rawValue = IOHIDValueGetIntegerValue(value);

    if (usagePage == kHIDPage_Button) {
        NSString *state = rawValue ? @"down" : @"up";
        PrintLine([NSString stringWithFormat:@"%@ %@ %@", TimestampString(), UsageDescription(usagePage, usage), state]);
        if (_mode == ControllerRunModeMouse && device == _activeDevice) {
            [self refreshSuspendedStateIfNeeded:NO];
            [self handleButtonUsage:usage isDown:(rawValue != 0)];
        } else if (_mode == ControllerRunModeTetris && device == _activeDevice) {
            [self handleTetrisButtonUsage:usage isDown:(rawValue != 0)];
        } else if (_mode == ControllerRunModeKeyboard && device == _activeDevice) {
            [self refreshSuspendedStateIfNeeded:NO];
            if (_isSuspended) {
                return;
            }
            [self handleKeyboardButtonUsage:usage isDown:(rawValue != 0)];
        }
        return;
    }

    double normalized = NormalizeAxisValue(element, rawValue);
    PrintLine([NSString stringWithFormat:@"%@ %@ raw=%ld normalized=%+.3f",
               TimestampString(),
               UsageDescription(usagePage, usage),
               (long)rawValue,
               normalized]);

    if ((_mode != ControllerRunModeMouse && _mode != ControllerRunModeTetris && _mode != ControllerRunModeKeyboard) || device != _activeDevice || usagePage != kHIDPage_GenericDesktop) {
        return;
    }

    if (usage == _xAxisUsage) {
        _xAxisValue = normalized;
    } else if (usage == _yAxisUsage) {
        _yAxisValue = normalized;
    } else if (usage == kHIDUsage_GD_Hatswitch) {
        _hatSwitchValue = (NSInteger)rawValue;
    }
}

- (void)movementTick {
    if ((_mode != ControllerRunModeMouse && _mode != ControllerRunModeTetris && _mode != ControllerRunModeKeyboard) || !_activeDevice) {
        _lastMoveTick = 0;
        return;
    }

    if (_mode == ControllerRunModeTetris) {
        [self updateTetrisDirectionalKeys];
        return;
    }
    if (_mode == ControllerRunModeKeyboard) {
        [self refreshSuspendedStateIfNeeded:NO];
        if (_isSuspended) {
            _lastMoveTick = 0;
            return;
        }
        [self updateKeyboardDirectionalKeys];
        return;
    }

    [self refreshSuspendedStateIfNeeded:NO];
    if (_isSuspended) {
        _lastMoveTick = 0;
        return;
    }

    CFAbsoluteTime now = CFAbsoluteTimeGetCurrent();
    if (_lastMoveTick == 0) {
        _lastMoveTick = now;
        return;
    }

    double deltaTime = now - _lastMoveTick;
    _lastMoveTick = now;
    if (deltaTime <= 0) {
        return;
    }

    double x = ApplyDeadzone(_xAxisValue, _deadzone);
    double y = ApplyDeadzone(_yAxisValue, _deadzone);
    if (x == 0 && y == 0) {
        return;
    }

    double magnitude = fmin(1.0, hypot(x, y));
    double pixelsPerFrame = _baseSpeed + (_acceleration * magnitude * magnitude);
    double frameScale = deltaTime * 60.0;
    _remainderX += x * pixelsPerFrame * frameScale;
    _remainderY += y * pixelsPerFrame * frameScale;

    NSInteger stepX = (NSInteger)(_remainderX > 0 ? floor(_remainderX) : ceil(_remainderX));
    NSInteger stepY = (NSInteger)(_remainderY > 0 ? floor(_remainderY) : ceil(_remainderY));
    if (stepX == 0 && stepY == 0) {
        return;
    }

    _remainderX -= stepX;
    _remainderY -= stepY;

    CGPoint point = CurrentCursorPosition();
    point.x += stepX;
    point.y += stepY;
    point = ClampPointToMainDisplay(point);

    CGEventRef moveEvent = CGEventCreateMouseEvent(NULL, kCGEventMouseMoved, point, kCGMouseButtonLeft);
    if (!moveEvent) {
        return;
    }
    CGEventSetIntegerValueField(moveEvent, kCGMouseEventDeltaX, stepX);
    CGEventSetIntegerValueField(moveEvent, kCGMouseEventDeltaY, stepY);
    CGEventPost(kCGHIDEventTap, moveEvent);
    CFRelease(moveEvent);
}

- (void)printControlSummaryForDevice:(IOHIDDeviceRef)device {
    CFArrayRef elements = IOHIDDeviceCopyMatchingElements(device, NULL, kIOHIDOptionsTypeNone);
    if (!elements) {
        return;
    }

    NSArray *sortedElements = [(__bridge NSArray *)elements sortedArrayUsingComparator:^NSComparisonResult(id left, id right) {
        IOHIDElementRef leftElement = (__bridge IOHIDElementRef)left;
        IOHIDElementRef rightElement = (__bridge IOHIDElementRef)right;
        uint32_t leftPage = IOHIDElementGetUsagePage(leftElement);
        uint32_t rightPage = IOHIDElementGetUsagePage(rightElement);
        if (leftPage != rightPage) {
            return leftPage < rightPage ? NSOrderedAscending : NSOrderedDescending;
        }
        uint32_t leftUsage = IOHIDElementGetUsage(leftElement);
        uint32_t rightUsage = IOHIDElementGetUsage(rightElement);
        if (leftUsage != rightUsage) {
            return leftUsage < rightUsage ? NSOrderedAscending : NSOrderedDescending;
        }
        return NSOrderedSame;
    }];

    PrintLine(@"Control summary:");
    for (id entry in sortedElements) {
        IOHIDElementRef element = (__bridge IOHIDElementRef)entry;
        IOHIDElementType type = IOHIDElementGetType(element);
        if (type != kIOHIDElementTypeInput_Button &&
            type != kIOHIDElementTypeInput_Misc &&
            type != kIOHIDElementTypeInput_Axis &&
            type != kIOHIDElementTypeInput_ScanCodes) {
            continue;
        }

        uint32_t usagePage = IOHIDElementGetUsagePage(element);
        if (usagePage != kHIDPage_GenericDesktop && usagePage != kHIDPage_Button) {
            continue;
        }

        uint32_t usage = IOHIDElementGetUsage(element);
        PrintLine([NSString stringWithFormat:
                   @"  %@ | type=%@ | logical=%ld..%ld",
                   UsageDescription(usagePage, usage),
                   ElementTypeDescription(type),
                   (long)IOHIDElementGetLogicalMin(element),
                   (long)IOHIDElementGetLogicalMax(element)]);
    }

    CFRelease(elements);
}

- (void)handleButtonUsage:(uint32_t)usage isDown:(BOOL)isDown {
    if (_isSuspended) {
        return;
    }

    if (usage == _leftButtonUsage) {
        if (_leftMouseDown != isDown) {
            _leftMouseDown = isDown;
            [self postMouseButton:kCGMouseButtonLeft isDown:isDown];
        }
        return;
    }

    if (usage == _rightButtonUsage) {
        if (_rightMouseDown != isDown) {
            _rightMouseDown = isDown;
            [self postMouseButton:kCGMouseButtonRight isDown:isDown];
        }
        return;
    }

    if (usage == _escapeButtonUsage && isDown) {
        [self postKeyCode:53];
        return;
    }

    if (usage == _returnButtonUsage && isDown) {
        [self postKeyCode:36];
    }
}

- (void)postMouseButton:(CGMouseButton)button isDown:(BOOL)isDown {
    CGPoint point = CurrentCursorPosition();
    CGEventType type = kCGEventMouseMoved;

    if (button == kCGMouseButtonLeft) {
        type = isDown ? kCGEventLeftMouseDown : kCGEventLeftMouseUp;
    } else if (button == kCGMouseButtonRight) {
        type = isDown ? kCGEventRightMouseDown : kCGEventRightMouseUp;
    }

    CGEventRef event = CGEventCreateMouseEvent(NULL, type, point, button);
    if (!event) {
        return;
    }
    CGEventSetIntegerValueField(event, kCGMouseEventClickState, 1);
    CGEventPost(kCGHIDEventTap, event);
    CFRelease(event);
}

- (void)postKeyCode:(CGKeyCode)keyCode {
    CGEventRef down = CGEventCreateKeyboardEvent(NULL, keyCode, true);
    CGEventRef up = CGEventCreateKeyboardEvent(NULL, keyCode, false);
    if (down) {
        CGEventPost(kCGHIDEventTap, down);
        CFRelease(down);
    }
    if (up) {
        CGEventPost(kCGHIDEventTap, up);
        CFRelease(up);
    }
}

- (void)postKeyCode:(CGKeyCode)keyCode isDown:(BOOL)isDown {
    CGEventRef event = CGEventCreateKeyboardEvent(NULL, keyCode, isDown);
    if (!event) {
        return;
    }
    CGEventPost(kCGHIDEventTap, event);
    CFRelease(event);
}

- (void)setTetrisKey:(CGKeyCode)keyCode isDown:(BOOL)isDown state:(BOOL *)state {
    if (*state == isDown) {
        return;
    }
    *state = isDown;
    [self postKeyCode:keyCode isDown:isDown];
}

- (void)tapKeyCode:(CGKeyCode)keyCode {
    [self postKeyCode:keyCode isDown:YES];
    [self postKeyCode:keyCode isDown:NO];
}

- (void)releaseHeldButtons {
    if (_leftMouseDown) {
        _leftMouseDown = NO;
        [self postMouseButton:kCGMouseButtonLeft isDown:NO];
    }
    if (_rightMouseDown) {
        _rightMouseDown = NO;
        [self postMouseButton:kCGMouseButtonRight isDown:NO];
    }
}

- (BOOL)hatSwitchIndicatesLeft {
    return _hatSwitchValue == 5 || _hatSwitchValue == 6 || _hatSwitchValue == 7;
}

- (BOOL)hatSwitchIndicatesRight {
    return _hatSwitchValue == 1 || _hatSwitchValue == 2 || _hatSwitchValue == 3;
}

- (BOOL)hatSwitchIndicatesDown {
    return _hatSwitchValue == 3 || _hatSwitchValue == 4 || _hatSwitchValue == 5;
}

- (void)updateTetrisDirectionalKeys {
    double x = ApplyDeadzone(_xAxisValue, _deadzone);
    double y = ApplyDeadzone(_yAxisValue, _deadzone);
    BOOL leftDown = (x <= -_tetrisMoveThreshold) || [self hatSwitchIndicatesLeft];
    BOOL rightDown = (x >= _tetrisMoveThreshold) || [self hatSwitchIndicatesRight];
    BOOL downDown = (y >= _tetrisMoveThreshold) || [self hatSwitchIndicatesDown];

    if (leftDown && rightDown) {
        leftDown = NO;
        rightDown = NO;
    }

    [self setTetrisKey:123 isDown:leftDown state:&_leftKeyDown];
    [self setTetrisKey:124 isDown:rightDown state:&_rightKeyDown];
    [self setTetrisKey:125 isDown:downDown state:&_downKeyDown];
}

- (void)handleTetrisButtonUsage:(uint32_t)usage isDown:(BOOL)isDown {
    if (!isDown) {
        return;
    }

    if (usage == _rotateCCWButtonUsage) {
        [self tapKeyCode:6];
        return;
    }
    if (usage == _rotateCWButtonUsage) {
        [self tapKeyCode:7];
        return;
    }
    if (usage == _holdButtonUsage) {
        [self tapKeyCode:8];
        return;
    }
    if (usage == _hardDropButtonUsage) {
        [self tapKeyCode:49];
        return;
    }
    if (usage == _pauseButtonUsage) {
        [self tapKeyCode:35];
        return;
    }
    if (usage == _restartButtonUsage) {
        [self tapKeyCode:15];
        return;
    }
}

- (void)releaseHeldTetrisKeys {
    [self setTetrisKey:123 isDown:NO state:&_leftKeyDown];
    [self setTetrisKey:124 isDown:NO state:&_rightKeyDown];
    [self setTetrisKey:125 isDown:NO state:&_downKeyDown];
}

- (void)updateKeyboardDirectionalKeys {
    double x = ApplyDeadzone(_xAxisValue, _deadzone);
    double y = ApplyDeadzone(_yAxisValue, _deadzone);
    BOOL leftDown = (x <= -_tetrisMoveThreshold) || [self hatSwitchIndicatesLeft];
    BOOL rightDown = (x >= _tetrisMoveThreshold) || [self hatSwitchIndicatesRight];
    BOOL upDown = (y <= -_tetrisMoveThreshold) || (_hatSwitchValue == 7 || _hatSwitchValue == 0 || _hatSwitchValue == 1);
    BOOL downDown = (y >= _tetrisMoveThreshold) || [self hatSwitchIndicatesDown];

    if (leftDown && rightDown) {
        leftDown = NO;
        rightDown = NO;
    }
    if (upDown && downDown) {
        upDown = NO;
        downDown = NO;
    }

    [self setTetrisKey:_keyboardLeftKeyCode isDown:leftDown state:&_leftKeyDown];
    [self setTetrisKey:_keyboardRightKeyCode isDown:rightDown state:&_rightKeyDown];
    [self setTetrisKey:_keyboardUpKeyCode isDown:upDown state:&_upKeyDown];
    [self setTetrisKey:_keyboardDownKeyCode isDown:downDown state:&_downKeyDown];
}

- (void)handleKeyboardButtonUsage:(uint32_t)usage isDown:(BOOL)isDown {
    if (!isDown) {
        return;
    }

    if (usage == _primaryButtonUsage) {
        [self tapKeyCode:_keyboardPrimaryKeyCode];
        return;
    }
    if (usage == _secondaryButtonUsage) {
        [self tapKeyCode:_keyboardSecondaryKeyCode];
        return;
    }
    if (usage == _pauseButtonUsage) {
        [self tapKeyCode:_keyboardPauseKeyCode];
        return;
    }
    if (usage == _restartButtonUsage) {
        [self tapKeyCode:_keyboardRestartKeyCode];
        return;
    }
}

- (void)releaseHeldKeyboardKeys {
    [self setTetrisKey:_keyboardLeftKeyCode isDown:NO state:&_leftKeyDown];
    [self setTetrisKey:_keyboardRightKeyCode isDown:NO state:&_rightKeyDown];
    [self setTetrisKey:_keyboardUpKeyCode isDown:NO state:&_upKeyDown];
    [self setTetrisKey:_keyboardDownKeyCode isDown:NO state:&_downKeyDown];
}

- (void)refreshSuspendedStateIfNeeded:(BOOL)force {
    if ((_mode != ControllerRunModeMouse && _mode != ControllerRunModeKeyboard) || [_suspendProcessNames count] == 0) {
        return;
    }

    CFAbsoluteTime now = CFAbsoluteTimeGetCurrent();
    if (!force && _lastSuspendCheck > 0 && (now - _lastSuspendCheck) < 0.35) {
        return;
    }
    _lastSuspendCheck = now;

    NSString *matchedProcess = nil;
    for (NSRunningApplication *application in [[NSWorkspace sharedWorkspace] runningApplications]) {
        NSArray *candidates = @[
            [application localizedName] ?: @"",
            [application bundleIdentifier] ?: @"",
            [[[application executableURL] path] lastPathComponent] ?: @"",
            [[application executableURL] path] ?: @"",
        ];

        for (NSString *token in _suspendProcessNames) {
            for (NSString *candidate in candidates) {
                if ([candidate rangeOfString:token options:NSCaseInsensitiveSearch].location != NSNotFound) {
                    matchedProcess = token;
                    break;
                }
            }
            if (matchedProcess) {
                break;
            }
        }

        if (matchedProcess) {
            break;
        }
    }

    if ((matchedProcess != nil) == _isSuspended) {
        return;
    }

    _isSuspended = (matchedProcess != nil);
    _remainderX = 0;
    _remainderY = 0;
    _lastMoveTick = 0;
    [self releaseHeldButtons];
    [self releaseHeldKeyboardKeys];

    if (_isSuspended) {
        PrintLine([NSString stringWithFormat:@"%@ suspended %@ mapping while %@ is running",
                   TimestampString(),
                   (_mode == ControllerRunModeKeyboard ? @"keyboard" : @"mouse"),
                   matchedProcess]);
    } else {
        PrintLine([NSString stringWithFormat:@"%@ resumed %@ mapping",
                   TimestampString(),
                   (_mode == ControllerRunModeKeyboard ? @"keyboard" : @"mouse")]);
    }
}

@end

static NSArray *CreateMatchingDictionaries(void) {
    return @[
        @{
            (__bridge NSString *)CFSTR(kIOHIDDeviceUsagePageKey): @(kHIDPage_GenericDesktop),
            (__bridge NSString *)CFSTR(kIOHIDDeviceUsageKey): @(kHIDUsage_GD_GamePad),
        },
        @{
            (__bridge NSString *)CFSTR(kIOHIDDeviceUsagePageKey): @(kHIDPage_GenericDesktop),
            (__bridge NSString *)CFSTR(kIOHIDDeviceUsageKey): @(kHIDUsage_GD_Joystick),
        },
        @{
            (__bridge NSString *)CFSTR(kIOHIDDeviceUsagePageKey): @(kHIDPage_GenericDesktop),
            (__bridge NSString *)CFSTR(kIOHIDDeviceUsageKey): @(kHIDUsage_GD_MultiAxisController),
        },
    ];
}

static NSString *DeviceStringProperty(IOHIDDeviceRef device, CFStringRef key) {
    if (!device) {
        return @"";
    }

    CFTypeRef property = IOHIDDeviceGetProperty(device, key);
    if (!property) {
        return @"";
    }

    if (CFGetTypeID(property) == CFStringGetTypeID()) {
        return [(__bridge NSString *)property copy];
    }

    if (CFGetTypeID(property) == CFNumberGetTypeID()) {
        return [(__bridge NSNumber *)property stringValue];
    }

    return [[(__bridge id)property description] copy];
}

static NSInteger DeviceIntegerProperty(IOHIDDeviceRef device, CFStringRef key, NSInteger fallback) {
    if (!device) {
        return fallback;
    }

    CFTypeRef property = IOHIDDeviceGetProperty(device, key);
    if (!property || CFGetTypeID(property) != CFNumberGetTypeID()) {
        return fallback;
    }

    NSInteger value = fallback;
    if (!CFNumberGetValue((CFNumberRef)property, kCFNumberNSIntegerType, &value)) {
        return fallback;
    }
    return value;
}

static NSString *GenericDesktopUsageName(uint32_t usage) {
    switch (usage) {
        case kHIDUsage_GD_Pointer: return @"Pointer";
        case kHIDUsage_GD_Mouse: return @"Mouse";
        case kHIDUsage_GD_Joystick: return @"Joystick";
        case kHIDUsage_GD_GamePad: return @"GamePad";
        case kHIDUsage_GD_Keyboard: return @"Keyboard";
        case kHIDUsage_GD_Keypad: return @"Keypad";
        case kHIDUsage_GD_MultiAxisController: return @"MultiAxisController";
        case kHIDUsage_GD_X: return @"X";
        case kHIDUsage_GD_Y: return @"Y";
        case kHIDUsage_GD_Z: return @"Z";
        case kHIDUsage_GD_Rx: return @"Rx";
        case kHIDUsage_GD_Ry: return @"Ry";
        case kHIDUsage_GD_Rz: return @"Rz";
        case kHIDUsage_GD_Slider: return @"Slider";
        case kHIDUsage_GD_Dial: return @"Dial";
        case kHIDUsage_GD_Wheel: return @"Wheel";
        case kHIDUsage_GD_Hatswitch: return @"HatSwitch";
        default:
            return [NSString stringWithFormat:@"GenericDesktop(0x%02x)", usage];
    }
}

static NSString *UsageDescription(uint32_t usagePage, uint32_t usage) {
    if (usagePage == kHIDPage_GenericDesktop) {
        return GenericDesktopUsageName(usage);
    }
    if (usagePage == kHIDPage_Button) {
        return [NSString stringWithFormat:@"Button %u", usage];
    }
    return [NSString stringWithFormat:@"UsagePage(0x%02x) Usage(0x%02x)", usagePage, usage];
}

static NSString *ElementTypeDescription(IOHIDElementType type) {
    switch (type) {
        case kIOHIDElementTypeInput_Misc: return @"input-misc";
        case kIOHIDElementTypeInput_Button: return @"input-button";
        case kIOHIDElementTypeInput_Axis: return @"input-axis";
        case kIOHIDElementTypeInput_ScanCodes: return @"input-scan";
        case kIOHIDElementTypeFeature: return @"feature";
        case kIOHIDElementTypeCollection: return @"collection";
        default:
            return [NSString stringWithFormat:@"type-%ld", (long)type];
    }
}

static NSString *TimestampString(void) {
    static NSDateFormatter *formatter = nil;
    if (!formatter) {
        formatter = [[NSDateFormatter alloc] init];
        formatter.dateFormat = @"HH:mm:ss.SSS";
    }
    return [formatter stringFromDate:[NSDate date]];
}

static void PrintLine(NSString *line) {
    fprintf(stdout, "%s\n", [line UTF8String]);
    fflush(stdout);
}

static double NormalizeAxisValue(IOHIDElementRef element, CFIndex rawValue) {
    CFIndex minimum = IOHIDElementGetLogicalMin(element);
    CFIndex maximum = IOHIDElementGetLogicalMax(element);
    if (maximum <= minimum) {
        return 0;
    }

    double center = ((double)minimum + (double)maximum) / 2.0;
    double halfRange = ((double)maximum - (double)minimum) / 2.0;
    if (halfRange == 0.0) {
        return 0;
    }

    double normalized = ((double)rawValue - center) / halfRange;
    if (normalized > 1.0) {
        return 1.0;
    }
    if (normalized < -1.0) {
        return -1.0;
    }
    return normalized;
}

static double ApplyDeadzone(double value, double deadzone) {
    double magnitude = fabs(value);
    if (magnitude <= deadzone) {
        return 0;
    }

    double adjusted = (magnitude - deadzone) / (1.0 - deadzone);
    return value < 0 ? -adjusted : adjusted;
}

static CGPoint CurrentCursorPosition(void) {
    CGEventRef event = CGEventCreate(NULL);
    if (!event) {
        return CGPointZero;
    }

    CGPoint point = CGEventGetLocation(event);
    CFRelease(event);
    return point;
}

static CGPoint ClampPointToMainDisplay(CGPoint point) {
    CGRect bounds = CGDisplayBounds(CGMainDisplayID());
    if (point.x < CGRectGetMinX(bounds)) {
        point.x = CGRectGetMinX(bounds);
    }
    if (point.x > CGRectGetMaxX(bounds) - 1) {
        point.x = CGRectGetMaxX(bounds) - 1;
    }
    if (point.y < CGRectGetMinY(bounds)) {
        point.y = CGRectGetMinY(bounds);
    }
    if (point.y > CGRectGetMaxY(bounds) - 1) {
        point.y = CGRectGetMaxY(bounds) - 1;
    }
    return point;
}

static BOOL ParseUInt32Value(NSString *text, uint32_t *value) {
    char *endPointer = NULL;
    unsigned long parsed = strtoul([text UTF8String], &endPointer, 10);
    if (!endPointer || *endPointer != '\0' || parsed > UINT32_MAX) {
        return NO;
    }
    *value = (uint32_t)parsed;
    return YES;
}

static BOOL ParseDoubleValue(NSString *text, double *value) {
    NSScanner *scanner = [NSScanner scannerWithString:text];
    double parsed = 0;
    BOOL okay = [scanner scanDouble:&parsed] && [scanner isAtEnd];
    if (okay) {
        *value = parsed;
    }
    return okay;
}

static BOOL ParseAxisUsage(NSString *text, uint32_t *usage) {
    NSString *lower = [text lowercaseString];
    if ([lower isEqualToString:@"x"]) {
        *usage = kHIDUsage_GD_X;
        return YES;
    }
    if ([lower isEqualToString:@"y"]) {
        *usage = kHIDUsage_GD_Y;
        return YES;
    }
    if ([lower isEqualToString:@"z"]) {
        *usage = kHIDUsage_GD_Z;
        return YES;
    }
    if ([lower isEqualToString:@"rx"]) {
        *usage = kHIDUsage_GD_Rx;
        return YES;
    }
    if ([lower isEqualToString:@"ry"]) {
        *usage = kHIDUsage_GD_Ry;
        return YES;
    }
    if ([lower isEqualToString:@"rz"]) {
        *usage = kHIDUsage_GD_Rz;
        return YES;
    }
    if ([lower isEqualToString:@"slider"]) {
        *usage = kHIDUsage_GD_Slider;
        return YES;
    }
    if ([lower isEqualToString:@"dial"]) {
        *usage = kHIDUsage_GD_Dial;
        return YES;
    }
    if ([lower isEqualToString:@"wheel"]) {
        *usage = kHIDUsage_GD_Wheel;
        return YES;
    }
    return ParseUInt32Value(text, usage);
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        NSMutableArray *arguments = [NSMutableArray arrayWithCapacity:(NSUInteger)argc];
        for (int index = 0; index < argc; index += 1) {
            [arguments addObject:[NSString stringWithUTF8String:argv[index]]];
        }

        ControllerApp *app = [[ControllerApp alloc] init];
        int parseResult = [app parseArguments:arguments];
        if (parseResult != 0) {
            return parseResult == 1 ? 0 : parseResult;
        }
        return [app run];
    }
}
