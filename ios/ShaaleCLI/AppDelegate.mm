#import "AppDelegate.h"
#import <AVFoundation/AVFoundation.h>
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"ShaaleCLI";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Set up AVAudioSession
  AVAudioSession *audioSession = [AVAudioSession sharedInstance];
  NSError *setCategoryError = nil;
  BOOL success = [audioSession setCategory:AVAudioSessionCategoryPlayAndRecord
                               withOptions:AVAudioSessionCategoryOptionMixWithOthers
                                     error:&setCategoryError];
  if (!success) {
    NSLog(@"Error setting category: %@", setCategoryError.localizedDescription);
  }

  NSError *activationError = nil;
  success = [audioSession setActive:YES error:&activationError];
  if (!success) {
    NSLog(@"Error activating audio session: %@", activationError.localizedDescription);
  }

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
