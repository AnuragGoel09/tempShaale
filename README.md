# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## Things to look out later on:

- Look for changes made in `android/app/src/main/java/MainActivity.kt/` according to [Doc](https://reactnavigation.org/docs/getting-started)

- Possibly try doing following if you get error while building the app after installing the new dependencies:

```
cd ios
pod install
```

- Can change primary color and all using [Doc](https://akveo.github.io/react-native-ui-kitten/docs/guides/branding#primary-color).

- To setup checkbox library on iOS refer [Doc](https://github.com/react-native-checkbox/react-native-checkbox?tab=readme-ov-file).

## To run on physical android device: Refer [Doc](https://reactnative.dev/docs/running-on-device)

1.  Turn on developer mode on the device. Then enable USB debugging. Make sure device is connected to the computer.
2.  Then run `npx react-native run-android` from the root of the project. No need to start the metro server separately or u can do `npx react-native start` and press 'a' to run on android.
3.  It will open the app on the device.
4.  Make sure device is listed in the output of `adb devices` command.
5.  Now to connect via Wi-Fi, follow instructions from [Doc](https://reactnative.dev/docs/running-on-device#wi-fi-connection).
6.  To get ipaddress of mac use `ipconfig getifaddr en0` and then open Dev menu on device and select `Dev Settings` and then `Debug server host & port for device` and enter the ipaddress and port number. Then reload the app. (eg. 10.0.1.1:8081)
7.  Reload the app and it should work. Can disconnect the USB cable now.

Sites which might help:

1. https://stackoverflow.com/questions/37500205/react-native-appinstalldebug-failed
2. https://stackoverflow.com/questions/37189081/react-native-command-not-found

## To reset cache and run the app:

- In one terminal run the following command:

```
npx react-native start --reset-cache
```

- In another terminal run the following command:

```
npx react-native run-ios (for ios)
npx react-native run-android (for android)
```

## To solve the issue of rendering of icons in iOS simulator:

- In `Info.plist` file add the following code:

```
<key>UIAppFonts</key>
<array>
	<string>AntDesign.ttf</string>
	<string>Entypo.ttf</string>
</array>
```

- After making these changes, build the app again using `npx react-native start` and `npx react-native run-ios` command. Possibly can try running with `--reset-cache` flag.

## Error Resolutions :

- If you get the following error while running the app on android device:

```
FAILURE: Build failed with an exception. * What went wrong: Execution failed for task ':app:installDebug'. > java.util.concurrent.ExecutionException: com.android.builder.testing.api.DeviceException: com.android.ddmlib.InstallException: INSTALL_FAILED_USER_RESTRICTED: Install canceled by user
```

Steps to solve it:

1.  Refer [this link](https://stackoverflow.com/questions/37500205/react-native-appinstalldebug-failed.).
2.  Remove any previous build of an app from the device.
3.  Run following command :
    ```
    cd android
    ./gradlew clean
    cd ..
    ```
4.  Then run `npm cache clean --force` command.
5.  Possibly restart the device.
6.  Also remember to enable `USB debugging` and `Install via USB` for the device before starting to build the app.
7.  Then run `npx react-native run-android` command and it should work.

---

- If you get the following error while running the app on iOS simulator:

```
note: Building targets in dependency order
error: unable to attach DB: error: accessing build database "/Users/apple/Library/Developer/Xcode/DerivedData/ShaaleCLI-fsljnubyehhehecbtxmajzodqrxl/Build/Intermediates.noindex/XCBuildData/build.db": database is locked Possibly there are two concurrent builds running in the same filesystem location.
warning: Run script build phase '[CP-User] [Hermes] Replace Hermes for the right configuration, if needed' will be run during every build because it does not specify any outputs. To address this warning, either add output dependencies to the script phase, or configure it to run in every build by unchecking "Based on dependency analysis" in the script phase. (in target 'hermes-engine' from project 'Pods')
warning: Run script build phase 'Bundle React Native code and images' will be run during every build because it does not specify any outputs. To address this warning, either add output dependencies to the script phase, or configure it to run in every build by unchecking "Based on dependency analysis" in the script phase. (in target 'ShaaleCLI' from project 'ShaaleCLI')

** BUILD FAILED **
```

Steps to solve it:

1.  Open the project in Xcode.
2.  Clean the build by going to `Product` -> `Clean Build Folder`.
3.  In VSCode, start the app using `npx react-native start` command and build it again.

---

- To resolve build issues with new version XCode(15.3) following links helped:

  1. https://stackoverflow.com/questions/78121217/build-error-on-xcode-15-3-called-object-type-facebookflippersocketcertifi
  2. https://stackoverflow.com/questions/73894220/flipperkit-flipperclient-h-file-not-found
  3. https://forums.developer.apple.com/forums/thread/731041

  - Mainly steps to solve the issue:
    1. Open the project in Xcode.
    2. Clean the build by going to `Product` -> `Clean Build Folder`.
    3. From project navigator search about ==> FlipperTransportTypes. Add this import ==> #include <functional>. Save file and run again.
    4. In podfile, commented out the following line `:flipper_configuration => flipper_config` and then run `cd ios && pod install  --repo-update` command.
    5. And also Check that `ENABLE_USER_SCRIPT_SANDBOXING` is disabled in the project's build settings. U can do it through XCode by disabling 'User Script Sandboxing' under the Project's Build Settings -> Build Options.
    6. Then rebuild the app (make sure version and build are increased by one than prvs) and after archiving, upload to App Store Connect.

- To patch the 'react-native-sound' library for iOS:
  1. Links: - https://dev.to/zhnedyalkow/the-easiest-way-to-patch-your-npm-package-4ece - https://medium.com/@rajrishij/how-to-patch-node-modules-2ba66c9a2e85
  2. Steps:
     1. Go to the node_modules folder and do changes in the library.
     2. Here I had to change the `RNSound.m` file in the `react-native-sound` library. Making changes in line numbers 204, 208 and 212.
     3. Then installing the `patch-package` library using `npm install patch-package` command.
     4. Adding the postinstall script in the `package.json` file:
        ```
        "scripts": {
           "postinstall": "patch-package"
        }
        ```
     5. Then running the `npx patch-package react-native-sound` command.
     6. Then commit the changes in the `patches` folder and `package.json` file using `git add .` and `git commit -m "Patched react-native-sound library for iOS"`.

- For following error in loading sound in iOS:
  ``` 
  LOG  failed to load the sound2 {"code": "ENSOSSTATUSERRORDOMAIN2003334207", "domain": "NSOSStatusErrorDomain", "message": "The operation couldn’t be completed. (OSStatus error 2003334207.)", "nativeStackIOS": ["0   ShaaleCLI                           0x0000000107ff9510 RCTJSErrorFromCodeMessageAndNSError + 112", "1   ShaaleCLI                           0x0000000107ff9450 RCTJSErrorFromNSError + 256", "2   ShaaleCLI                           0x0000000107edb2a6 -[RNSound prepare:withKey:withOptions:withCallback:] + 1638", "3   CoreFoundation                      0x00007ff8004d419c __invoking___ + 140", "4   CoreFoundation                      0x00007ff8004d14c3 -[NSInvocation invoke] + 302", "5   CoreFoundation                      0x00007ff8004d1733 -[NSInvocation invokeWithTarget:] + 70", "6   ShaaleCLI                           0x0000000107f9662f -[RCTModuleMethod invokeWithBridge:module:arguments:] + 2495", "7   ShaaleCLI                           0x0000000107f9b224 _ZN8facebook5reactL11invokeInnerEP9RCTBridgeP13RCTModuleDatajRKN5folly7dynamicEiN12_GLOBAL__N_117SchedulingContextE + 2036", "8   ShaaleCLI                           0x0000000107f9a875 _ZZN8facebook5react15RCTNativeModule6invokeEjON5folly7dynamicEiENK3$_0clEv + 133", "9   ShaaleCLI                           0x0000000107f9a7e9 ___ZN8facebook5react15RCTNativeModule6invokeEjON5folly7dynamicEi_block_invoke + 25", "10  libdispatch.dylib                   0x00007ff8001783ec _dispatch_call_block_and_release + 12", "11  libdispatch.dylib                   0x00007ff8001796d8 _dispatch_client_callout + 8", "12  libdispatch.dylib                   0x00007ff80018127d _dispatch_lane_serial_drain + 1228", "13  libdispatch.dylib                   0x00007ff800181e17 _dispatch_lane_invoke + 406", "14  libdispatch.dylib                   0x00007ff80018d9a8 _dispatch_root_queue_drain_deferred_wlh + 276", "15  libdispatch.dylib                   0x00007ff80018cf72 _dispatch_workloop_worker_thread + 552", "16  libsystem_pthread.dylib             0x000000010b104b84 _pthread_wqthread + 327", "17  libsystem_pthread.dylib             0x000000010b103acf start_wqthread + 15"], "userInfo": {}}
  ```
   - To solve this make sure u change following line from 
   ```
   new Sound(lesson.audioFileURL, Sound.MAIN_BUNDLE, (error) => {...})
   ``` 
   to 
   ```
   new Sound(lesson.audioFileURL, '', (error) => {...})
   ```
   everywhere in the code where u are using `react-native-sound` library.