package com.shaalecli;

import android.media.MediaPlayer;
import android.net.Uri;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.IOException;

public class AudioModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "AudioModule";
    private MediaPlayer mediaPlayer;

    public AudioModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mediaPlayer = new MediaPlayer();
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void playAudio(String audioFileName, Promise promise) {
        try {
            if (mediaPlayer.isPlaying()) {
                mediaPlayer.stop();
                mediaPlayer.reset();
            }

            int resID = getReactApplicationContext().getResources().getIdentifier(audioFileName, "raw",
                    getReactApplicationContext().getPackageName());
            if (resID == 0) {
                promise.reject("Error", "Resource not found: " + audioFileName);
                return;
            }

            Uri uri = Uri.parse("android.resource://" + getReactApplicationContext().getPackageName() + "/" + resID);
            mediaPlayer.setDataSource(getReactApplicationContext(), uri);
            mediaPlayer.prepare();
            mediaPlayer.start();
            promise.resolve("Audio started");
        } catch (IOException e) {
            promise.reject("Error", e);
        }
    }

    @ReactMethod
    public void stopAudio(Promise promise) {
        if (mediaPlayer.isPlaying()) {
            mediaPlayer.stop();
            mediaPlayer.reset();
            promise.resolve("Audio stopped");
        } else {
            promise.reject("Error", "No audio is playing");
        }
    }
}
