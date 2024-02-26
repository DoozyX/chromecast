package com.doozyx.plugins.google_cast_sender_example

import android.content.Context
import com.google.android.gms.cast.framework.OptionsProvider
//import com.google.android.gms.cast.framework.media.NotificationOptions
//import com.google.android.gms.cast.framework.media.CastMediaOptions
//import com.google.android.gms.cast.CredentialsData
//import com.google.android.gms.cast.LaunchOptions
import com.google.android.gms.cast.framework.CastOptions
import com.google.android.gms.cast.framework.SessionProvider

class CastOptionsProvider : OptionsProvider {
    override fun getCastOptions(context: Context): CastOptions {
//        val notificationOptions = NotificationOptions.Builder()
//            .setTargetActivityClassName(ExpandedControlsActivity::class.java.name)
//            .build()
//        val mediaOptions = CastMediaOptions.Builder()
//            .setNotificationOptions(notificationOptions)
//            .setExpandedControllerActivityClassName(ExpandedControlsActivity::class.java.name)
//            .build()
//        val credentialsData = CredentialsData.Builder()
//            .setCredentials("{\"userId\": \"abc\"}")
//            .build()
//        val launchOptions = LaunchOptions.Builder()
//            .setAndroidReceiverCompatible(true)
//            .setCredentialsData(credentialsData)
//            .build()
        return CastOptions.Builder()
//            .setLaunchOptions(launchOptions)
            .setReceiverApplicationId("72A0DA66")
//            .setCastMediaOptions(mediaOptions)
            .build()
    }

    override fun getAdditionalSessionProviders(context: Context): List<SessionProvider>? {
        return null
    }
}