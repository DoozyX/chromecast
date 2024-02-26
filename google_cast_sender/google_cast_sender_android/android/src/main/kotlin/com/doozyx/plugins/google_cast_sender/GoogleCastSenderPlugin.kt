package com.doozyx.plugins.google_cast_sender

import android.content.Context
import android.util.Log
import androidx.mediarouter.media.MediaRouter
import com.google.android.gms.cast.CastDevice
import com.google.android.gms.cast.MediaInfo
import com.google.android.gms.cast.MediaLoadRequestData
import com.google.android.gms.cast.framework.CastContext
import com.google.android.gms.cast.framework.CastSession
import com.google.android.gms.cast.framework.CastStateListener
import com.google.android.gms.cast.framework.SessionManager
import com.google.android.gms.cast.framework.SessionManagerListener
import io.flutter.embedding.engine.plugins.FlutterPlugin


class GoogleCastSenderPlugin : FlutterPlugin {
    private lateinit var context: Context
    private var api: GoogleCastSenderApiImplementation? = null
    private var mCastStateListener: CastStateListener? = null
    private var mCastSession: CastSession? = null
    private lateinit var mCastContext: CastContext
    private lateinit var mSessionManager: SessionManager
    private val mSessionManagerListener: SessionManagerListenerImpl =
        SessionManagerListenerImpl()
    private var mUrl: String? = null

    override fun onAttachedToEngine(
        flutterPluginBinding: FlutterPlugin.FlutterPluginBinding
    ) {
        context = flutterPluginBinding.applicationContext
        api = GoogleCastSenderApiImplementation()
        GoogleCastSenderApi.setUp(flutterPluginBinding.binaryMessenger, api)
        mCastStateListener =
            CastStateListener { newState -> Log.d("PLUGIGINCAST", "onCastStateChanged: $newState") }
        mCastContext = CastContext.getSharedInstance(context)
        mSessionManager = mCastContext.sessionManager
        // Listen for a successful join
        // Listen for a successful join
        mSessionManager.addSessionManagerListener(mSessionManagerListener, CastSession::class.java)
//        mSessionManager.addSessionManagerListener(
//            mSessionManagerListener,
//            CastSession::class.java
//        )
    }

    private inner class SessionManagerListenerImpl : SessionManagerListener<CastSession> {
        override fun onSessionEnded(p0: CastSession, p1: Int) {
            Log.d("TAG", "onSessionEnded")
        }

        override fun onSessionEnding(p0: CastSession) {
            Log.d("TAG", "onSessionEnding")
        }

        override fun onSessionResumeFailed(p0: CastSession, p1: Int) {
            Log.d("TAG", "onSessionResumeFailed")
        }

        override fun onSessionResumed(p0: CastSession, p1: Boolean) {
            Log.d("TAG", "onSessionResumed")
        }

        override fun onSessionResuming(p0: CastSession, p1: String) {
            Log.d("TAG", "onSessionResuming")
        }

        override fun onSessionStartFailed(p0: CastSession, p1: Int) {
            Log.d("TAG", "onSessionStartFailed")
        }

        override fun onSessionStarted(p0: CastSession, p1: String) {
            mCastSession = p0
            val url = mUrl
                ?: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            val mediaInfoBuilder = MediaInfo.Builder(url).build()

//            mediaInfoBuilder.setMetadata(createMediaMetadata(metadata))

//            val trackStyle: TextTrackStyle = ChromecastUtilities.parseTextTrackStyle(textTrackStyle)

//            mediaInfoBuilder
//                .setContentType(contentType)
//                .setCustomData(customData)
//                .setStreamType(intStreamType)
//                .setStreamDuration(duration.toLong())
//                .setTextTrackStyle(trackStyle)

            val loadRequest = MediaLoadRequestData.Builder()
                .setMediaInfo(mediaInfoBuilder)
                .setAutoplay(true)
//                .setCurrentTime(currentTime as Long * 1000)
                .build()

            Log.d("TAG", "LOADDD stream " + mUrl)

            mCastSession?.remoteMediaClient?.load(loadRequest)
        }

        override fun onSessionStarting(p0: CastSession) {
            Log.d("TAG", "onSessionStarting")
        }

        override fun onSessionSuspended(p0: CastSession, p1: Int) {
            Log.d("TAG", "onSessionSuspended")
        }

    }


    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        GoogleCastSenderApi.setUp(binding.binaryMessenger, null)
//        context = null
    }

    private inner class GoogleCastSenderApiImplementation :
        GoogleCastSenderApi {

        override fun init() {
            print("Init message")
        }

        override fun load(url: String, licenseUrl: String?, jwt: String?) {
            mUrl = url
            print("LOADDD message")
            Log.d("TAG", "LOADDD message")
            val router =
                MediaRouter.getInstance(context)
            val routes = router.routes
            for (routeInfo in routes) {
                val device = CastDevice.getFromBundle(routeInfo.extras)
                Log.d("TAG", "Device: " + device?.friendlyName + " ID: " + device?.deviceId)
                if (device?.deviceId == "834ebccbc5691404cbb1e9b29544566d") {
                    Log.d("TAG", "Device connecting...")
                    router.selectRoute(routeInfo)
                }
            }
        }

        override fun play() {
            TODO("Not yet implemented")
        }

        override fun pause() {
            TODO("Not yet implemented")
        }

        override fun seekTo(position: Long) {
            TODO("Not yet implemented")
        }
    }
}
