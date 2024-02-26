package com.doozyx.plugins.google_cast_sender
//
//import android.app.Activity
//import android.app.AlertDialog
//import android.content.DialogInterface
//import android.content.SharedPreferences
//import android.os.Handler
//import androidx.appcompat.R
//import androidx.arch.core.util.Function
//import androidx.mediarouter.app.MediaRouteChooserDialog
//import androidx.mediarouter.media.MediaRouteSelector
//import androidx.mediarouter.media.MediaRouter
//import com.google.android.gms.cast.CastDevice
//import com.google.android.gms.cast.CastMediaControlIntent
//import com.google.android.gms.cast.framework.CastContext
//import com.google.android.gms.cast.framework.CastSession
//import com.google.android.gms.cast.framework.CastState
//import com.google.android.gms.cast.framework.CastStateListener
//import com.google.android.gms.cast.framework.SessionManager
//import com.google.android.gms.cast.framework.SessionManagerListener
//import org.json.JSONObject
//
//
//class ChromecastConnection internal constructor(
//    /** Lifetime variable.  */
//    private val activity: Activity,
//    /** The Listener callback.  */
//    private val listener: Listener
//) {
//    /** settings object.  */
//    private val settings: SharedPreferences
//
//    /** Controls the chromecastSession.  */
//    private val chromecastSession: ChromecastSession
//
//    /** Lifetime variable.  */
//    private var newConnectionListener: SessionListener? = null
//
//    /** Indicates whether we left the session or stopped it.  */
//    private var sessionEndBecauseOfLeave = false
//
//    /** Any callback to call after sessionEnd.  */
//    private var sessionEndCallback: CallbackContext? = null
//
//    /** Initialize lifetime variable.  */
//    private var appId: String?
//
//    /**
//     * Constructor.
//     * @param act the current context
//     * @param connectionListener client callbacks for specific events
//     */
//    init {
//        settings =
//            activity.getSharedPreferences("CORDOVA-PLUGIN-CHROMECAST_ChromecastConnection", 0)
//        appId = settings.getString(
//            "appId",
//            CastMediaControlIntent.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID
//        )
//        chromecastSession = ChromecastSession(activity, listener)
//
//        // Set the initial appId
//        CastOptionsProvider.setAppId(appId)
//
//        // This is the first call to getContext which will start up the
//        // CastContext and prep it for searching for a session to rejoin
//        // Also adds the receiver update callback
//        context.addCastStateListener(listener)
//        sessionManager.addSessionManagerListener<CastSession>(object : SessionListener() {
//            override fun onSessionEnded(castSession: CastSession?, errCode: Int) {
//                chromecastSession.setSession(null)
//                if (sessionEndCallback != null) {
//                    sessionEndCallback.success()
//                }
//                listener.onSessionEnd(
//                    ChromecastUtilities.createSessionObject(
//                        castSession,
//                        if (sessionEndBecauseOfLeave) "disconnected" else "stopped"
//                    )
//                )
//                // Reset
//                sessionEndBecauseOfLeave = false
//                sessionEndCallback = null
//            }
//        }, CastSession::class.java)
//    }
//
//    /**
//     * Get the ChromecastSession object for controlling media and receiver functions.
//     * @return the ChromecastSession object
//     */
//    fun getChromecastSession(): ChromecastSession {
//        return chromecastSession
//    }
//
//    /**
//     * Must be called each time the appId changes and at least once before any other method is called.
//     * @param applicationId the app id to use
//     * @param callback called when initialization is complete
//     */
//    fun initialize(applicationId: String?, callback: CallbackContext) {
//        activity.runOnUiThread(Runnable {
//            // If the app Id changed
//            if (applicationId == null || applicationId != appId) {
//                // If app Id is valid
//                if (isValidAppId(applicationId)) {
//                    // Set the new app Id
//                    setAppId(applicationId)
//                } else {
//                    // Else, just return
//                    callback.success()
//                    return@Runnable
//                }
//            }
//
//            // Tell the client that initialization was a success
//            callback.success()
//
//            // Check if there is any available receivers for 5 seconds
//            startRouteScan(5000L, object : ScanCallback() {
//                override fun onRouteUpdate(routes: List<MediaRouter.RouteInfo?>?) {
//                    // if the routes have changed, we may have an available device
//                    // If there is at least one device available
//                    if (context.castState != CastState.NO_DEVICES_AVAILABLE) {
//                        // Stop the scan
//                        stopRouteScan(this, null)
//                        // Let the client know a receiver is available
//                        listener.onReceiverAvailableUpdate(true)
//                        // Since we have a receiver we may also have an active session
//                        val session: CastSession = sessionManager.currentCastSession
//                        // If we do have a session
//                        if (session != null) {
//                            // Let the client know
//                            chromecastSession.setSession(session)
//                            listener.onSessionRejoin(ChromecastUtilities.createSessionObject(session))
//                        }
//                    }
//                }
//            }, null)
//        })
//    }
//
//    private val mediaRouter: MediaRouter
//        private get() = MediaRouter.getInstance(activity)
//    private val context: CastContext
//        private get() = CastContext.getSharedInstance(activity)
//    private val sessionManager: SessionManager
//        private get() = context.sessionManager
//    private val session: CastSession?
//        private get() = sessionManager.currentCastSession
//
//    private fun setAppId(applicationId: String?) {
//        appId = applicationId
//        settings.edit().putString("appId", appId).apply()
//        context.setReceiverApplicationId(appId!!)
//    }
//
//    /**
//     * Tests if an application receiver id is valid.
//     * @param applicationId - application receiver id
//     * @return true if valid
//     */
//    private fun isValidAppId(applicationId: String?): Boolean {
//        return try {
//            val cb: ScanCallback = object : ScanCallback() {
//                override fun onRouteUpdate(routes: List<MediaRouter.RouteInfo?>?) {}
//            }
//            // This will throw if the applicationId is invalid
//            mediaRouter.addCallback(
//                MediaRouteSelector.Builder()
//                    .addControlCategory(CastMediaControlIntent.categoryForCast(applicationId!!))
//                    .build(),
//                cb,
//                MediaRouter.CALLBACK_FLAG_PERFORM_ACTIVE_SCAN
//            )
//            // If no exception we passed, so remove the callback
//            mediaRouter.removeCallback(cb)
//            true
//        } catch (e: IllegalArgumentException) {
//            // Don't set the appId if it is not a valid receiverApplicationID
//            false
//        }
//    }
//
//    /**
//     * This will create a new session or seamlessly selectRoute an existing one if we created it.
//     * @param routeId the id of the route to selectRoute
//     * @param callback calls callback.onJoin when we have joined a session,
//     * or callback.onError if an error occurred
//     */
//    fun selectRoute(routeId: String, callback: SelectRouteCallback) {
//        activity.runOnUiThread(object : Runnable {
//            override fun run() {
//                if (session != null && session.isConnected()) {
//                    callback.onError(
//                        ChromecastUtilities.createError(
//                            "session_error",
//                            "Leave or stop current session before attempting to join new session."
//                        )
//                    )
//                    return
//                }
//
//                // We need this hack so that we can access these values in callbacks without having
//                // to store it as a global variable, just always access first element
//                val foundRoute = booleanArrayOf(false)
//                val sentResult = booleanArrayOf(false)
//                val retries = intArrayOf(0)
//
//                // We need to start an active scan because getMediaRouter().getRoutes() may be out
//                // of date.  Also, maintaining a list of known routes doesn't work.  It is possible
//                // to have a route in your "known" routes list, but is not in
//                // getMediaRouter().getRoutes() which will result in "Ignoring attempt to select
//                // removed route: ", even if that route *should* be available.  This state could
//                // happen because routes are periodically "removed" and "added", and if the last
//                // time chromecastSession router was scanning ended when the route was temporarily removed the
//                // getRoutes() fn will have no record of the route.  We need the active scan to
//                // avoid this situation as well.  PS. Just running the scan non-stop is a poor idea
//                // since it will drain battery power quickly.
//                val scan: ScanCallback = object : ScanCallback() {
//                    override fun onRouteUpdate(routes: List<MediaRouter.RouteInfo>) {
//                        // Look for the matching route
//                        for (route in routes) {
//                            if (!foundRoute[0] && route.id == routeId) {
//                                // Found the route!
//                                foundRoute[0] = true
//                                // try-catch for issue:
//                                // https://github.com/jellyfin/cordova-plugin-chromecast/issues/48
//                                try {
//                                    // Try selecting the route!
//                                    this.mediaRouter!!.selectRoute(route)
//                                } catch (e: NullPointerException) {
//                                    // Let it try to find the route again
//                                    foundRoute[0] = false
//                                }
//                            }
//                        }
//                    }
//                }
//                val retry: Runnable = object : Runnable {
//                    override fun run() {
//                        // Reset foundRoute
//                        foundRoute[0] = false
//                        // Feed current routes into scan so that it can retry.
//                        // If route is there, it will try to join,
//                        // if not, it should wait for the scan to find the route
//                        scan.onRouteUpdate(mediaRouter.routes)
//                    }
//                }
//                val sendErrorResult: Function<JSONObject, Void> =
//                    Function { message ->
//                        if (!sentResult[0]) {
//                            sentResult[0] = true
//                            stopRouteScan(scan, null)
//                            callback.onError(message)
//                        }
//                        null
//                    }
//                listenForConnection(object : ConnectionCallback {
//                    override fun onJoin(jsonSession: JSONObject?) {
//                        sentResult[0] = true
//                        stopRouteScan(scan, null)
//                        callback.onJoin(jsonSession)
//                    }
//
//                    override fun onSessionStartFailed(errorCode: Int): Boolean {
//                        return if (errorCode == 7 || errorCode == 15) {
//                            // It network or timeout error retry
//                            retry.run()
//                            false
//                        } else {
//                            sendErrorResult.apply(
//                                ChromecastUtilities.createError(
//                                    "session_error",
//                                    "Failed to start session with error code: $errorCode"
//                                )
//                            )
//                            true
//                        }
//                    }
//
//                    override fun onSessionEndedBeforeStart(errorCode: Int): Boolean {
//                        return if (retries[0] < 10) {
//                            retries[0]++
//                            retry.run()
//                            false
//                        } else {
//                            sendErrorResult.apply(
//                                ChromecastUtilities.createError(
//                                    "session_error",
//                                    "Failed to to join existing route (" + routeId + ") " + retries[0] + 1 + " times before giving up."
//                                )
//                            )
//                            true
//                        }
//                    }
//                })
//                startRouteScan(15000L, scan) {
//                    sendErrorResult.apply(
//                        ChromecastUtilities.createError(
//                            "timeout",
//                            "Failed to join route (" + routeId + ") after 15s and " + (retries[0] + 1) + " tries."
//                        )
//                    )
//                }
//            }
//        })
//    }
//
//    /**
//     * Will do one of two things:
//     *
//     * If no current connection will:
//     * 1)
//     * Displays the built in native prompt to the user.
//     * It will actively scan for routes and display them to the user.
//     * Upon selection it will immediately attempt to selectRoute the route.
//     * Will call onJoin, onError or onCancel, of callback.
//     *
//     * Else we have a connection, so:
//     * 2)
//     * Displays the active connection dialog which includes the option
//     * to disconnect.
//     * Will only call onCancel of callback if the user cancels the dialog.
//     *
//     * @param callback calls callback.success when we have joined a session,
//     * or callback.error if an error occurred or if the dialog was dismissed
//     */
//    fun requestSession(callback: RequestSessionCallback) {
//        activity.runOnUiThread(object : Runnable {
//            override fun run() {
//                val session: CastSession = session
//                if (session == null) {
//                    // show the "choose a connection" dialog
//
//                    // Add the connection listener callback
//                    listenForConnection(callback)
//
//                    // Create the dialog
//                    // TODO accept theme as a config.xml option
//                    val builder =
//                        MediaRouteChooserDialog(activity, R.style.Theme_AppCompat_NoActionBar)
//                    builder.routeSelector = MediaRouteSelector.Builder()
//                        .addControlCategory(CastMediaControlIntent.categoryForCast(appId!!))
//                        .build()
//                    builder.setCanceledOnTouchOutside(true)
//                    builder.setOnCancelListener(object : DialogInterface.OnCancelListener {
//                        override fun onCancel(dialog: DialogInterface) {
//                            sessionManager.removeSessionManagerListener<CastSession>(
//                                newConnectionListener,
//                                CastSession::class.java
//                            )
//                            callback.onCancel()
//                        }
//                    })
//                    builder.show()
//                } else {
//                    // We are are already connected, so show the "connection options" Dialog
//                    val builder = AlertDialog.Builder(activity)
//                    if (session.castDevice != null) {
//                        builder.setTitle(session.castDevice!!.friendlyName)
//                    }
//                    builder.setOnDismissListener { callback.onCancel() }
//                    builder.setPositiveButton(
//                        "Stop Casting"
//                    ) { dialog, which -> endSession(true, null) }
//                    builder.show()
//                }
//            }
//        })
//    }
//
//    /**
//     * Must be called from the main thread.
//     * @param callback calls callback.success when we have joined, or callback.error if an error occurred
//     */
//    private fun listenForConnection(callback: ConnectionCallback) {
//        // We should only ever have one of these listeners active at a time, so remove previous
//        sessionManager.removeSessionManagerListener(newConnectionListener, CastSession::class.java)
//        newConnectionListener = object : SessionListener() {
//            override fun onSessionStarted(castSession: CastSession?, sessionId: String?) {
//                sessionManager.removeSessionManagerListener<CastSession>(
//                    this,
//                    CastSession::class.java
//                )
//                chromecastSession.setSession(castSession)
//                callback.onJoin(ChromecastUtilities.createSessionObject(castSession))
//            }
//
//            override fun onSessionStartFailed(castSession: CastSession?, errCode: Int) {
//                if (callback.onSessionStartFailed(errCode)) {
//                    sessionManager.removeSessionManagerListener<CastSession>(
//                        this,
//                        CastSession::class.java
//                    )
//                }
//            }
//
//            override fun onSessionEnded(castSession: CastSession?, errCode: Int) {
//                if (callback.onSessionEndedBeforeStart(errCode)) {
//                    sessionManager.removeSessionManagerListener<CastSession>(
//                        this,
//                        CastSession::class.java
//                    )
//                }
//            }
//        }
//        sessionManager.addSessionManagerListener(
//            newConnectionListener,
//            CastSession::class.java
//        )
//    }
//
//    /**
//     * Starts listening for receiver updates.
//     * Must call stopRouteScan(callback) or the battery will drain with non-stop active scanning.
//     * @param timeout ms until the scan automatically stops,
//     * if 0 only calls callback.onRouteUpdate once with the currently known routes
//     * if null, will scan until stopRouteScan is called
//     * @param callback the callback to receive route updates on
//     * @param onTimeout called when the timeout hits
//     */
//    fun startRouteScan(timeout: Long?, callback: ScanCallback, onTimeout: Runnable?) {
//        // Add the callback in active scan mode
//        activity.runOnUiThread(object : Runnable {
//            override fun run() {
//                callback.setMediaRouter(mediaRouter)
//                if (timeout != null && timeout == 0L) {
//                    // Send out the one time routes
//                    callback.onFilteredRouteUpdate()
//                    return
//                }
//
//                // Add the callback in active scan mode
//                mediaRouter.addCallback(
//                    MediaRouteSelector.Builder()
//                        .addControlCategory(CastMediaControlIntent.categoryForCast(appId!!))
//                        .build(),
//                    callback,
//                    MediaRouter.CALLBACK_FLAG_PERFORM_ACTIVE_SCAN
//                )
//
//                // Send out the initial routes after the callback has been added.
//                // This is important because if the callback calls stopRouteScan only once, and it
//                // happens during this call of "onFilterRouteUpdate", there must actually be an
//                // added callback to remove to stop the scan.
//                callback.onFilteredRouteUpdate()
//                if (timeout != null) {
//                    // remove the callback after timeout ms, and notify caller
//                    Handler().postDelayed(object : Runnable {
//                        override fun run() {
//                            // And stop the scan for routes
//                            mediaRouter.removeCallback(callback)
//                            // Notify
//                            onTimeout?.run()
//                        }
//                    }, timeout)
//                }
//            }
//        })
//    }
//
//    /**
//     * Call to stop the active scan if any exist.
//     * @param callback the callback to stop and remove
//     * @param completionCallback called on completion
//     */
//    fun stopRouteScan(callback: ScanCallback?, completionCallback: Runnable?) {
//        if (callback == null) {
//            completionCallback!!.run()
//            return
//        }
//        activity.runOnUiThread(object : Runnable {
//            override fun run() {
//                callback.stop()
//                mediaRouter.removeCallback(callback)
//                completionCallback?.run()
//            }
//        })
//    }
//
//    /**
//     * Exits the current session.
//     * @param stopCasting should the receiver application  be stopped as well?
//     * @param callback called with .success or .error depending on the initial result
//     */
//    fun endSession(stopCasting: Boolean, callback: CallbackContext?) {
//        activity.runOnUiThread(object : Runnable {
//            override fun run() {
//                sessionEndCallback = callback
//                sessionEndBecauseOfLeave = !stopCasting
//                sessionManager.endCurrentSession(stopCasting)
//            }
//        })
//    }
//
//    /**
//     * Create this empty class so that we don't have to override every function
//     * each time we need a SessionManagerListener.
//     */
//    private inner class SessionListener : SessionManagerListener<CastSession?> {
//        override fun onSessionStarting(castSession: CastSession?) {}
//        override fun onSessionStarted(castSession: CastSession?, sessionId: String) {}
//        override fun onSessionStartFailed(castSession: CastSession?, error: Int) {}
//        override fun onSessionEnding(castSession: CastSession?) {}
//        override fun onSessionEnded(castSession: CastSession?, error: Int) {}
//        override fun onSessionResuming(castSession: CastSession?, sessionId: String) {}
//        override fun onSessionResumed(castSession: CastSession?, wasSuspended: Boolean) {}
//        override fun onSessionResumeFailed(castSession: CastSession?, error: Int) {}
//        override fun onSessionSuspended(castSession: CastSession?, reason: Int) {}
//    }
//
//    internal interface SelectRouteCallback {
//        fun onJoin(jsonSession: JSONObject?)
//        fun onError(message: JSONObject?)
//    }
//
//    internal abstract class RequestSessionCallback : ConnectionCallback {
//        abstract fun onError(errorCode: Int)
//        abstract fun onCancel()
//        override fun onSessionEndedBeforeStart(errorCode: Int): Boolean {
//            onSessionStartFailed(errorCode)
//            return true
//        }
//
//        override fun onSessionStartFailed(errorCode: Int): Boolean {
//            onError(errorCode)
//            return true
//        }
//    }
//
//    internal interface ConnectionCallback {
//        /**
//         * Successfully joined a session on a route.
//         * @param jsonSession the session we joined
//         */
//        fun onJoin(jsonSession: JSONObject?)
//
//        /**
//         * Called if we received an error.
//         * @param errorCode You can find the error meaning here:
//         * https://developers.google.com/android/reference/com/google/android/gms/cast/CastStatusCodes
//         * @return true if we are done listening for join, false, if we to keep listening
//         */
//        fun onSessionStartFailed(errorCode: Int): Boolean
//
//        /**
//         * Called when we detect a session ended event before session started.
//         * See issues:
//         * https://github.com/jellyfin/cordova-plugin-chromecast/issues/49
//         * https://github.com/jellyfin/cordova-plugin-chromecast/issues/48
//         * @param errorCode error to output
//         * @return true if we are done listening for join, false, if we to keep listening
//         */
//        fun onSessionEndedBeforeStart(errorCode: Int): Boolean
//    }
//
//    abstract class ScanCallback : MediaRouter.Callback() {
//        /**
//         * Called whenever a route is updated.
//         * @param routes the currently available routes
//         */
//        abstract fun onRouteUpdate(routes: List<MediaRouter.RouteInfo>?)
//
//        /** records whether we have been stopped or not.  */
//        private var stopped = false
//
//        /** Global mediaRouter object.  */
//        private var mediaRouter: MediaRouter? = null
//
//        /**
//         * Sets the mediaRouter object.
//         * @param router mediaRouter object
//         */
//        fun setMediaRouter(router: MediaRouter?) {
//            mediaRouter = router
//        }
//
//        /**
//         * Call this method when you wish to stop scanning.
//         * It is important that it is called, otherwise battery
//         * life will drain more quickly.
//         */
//        fun stop() {
//            stopped = true
//        }
//
//        private fun onFilteredRouteUpdate() {
//            if (stopped || mediaRouter == null) {
//                return
//            }
//            val outRoutes: MutableList<MediaRouter.RouteInfo> = ArrayList()
//            // Filter the routes
//            for (route in mediaRouter!!.routes) {
//                // We don't want default routes, or duplicate active routes
//                // or multizone duplicates https://github.com/jellyfin/cordova-plugin-chromecast/issues/32
//                val extras = route.extras
//                if (extras != null) {
//                    CastDevice.getFromBundle(extras)
//                    if (extras.getString("com.google.android.gms.cast.EXTRA_SESSION_ID") != null) {
//                        continue
//                    }
//                }
//                if (!route.isDefault
//                    && route.description != "Google Cast Multizone Member" && route.playbackType == MediaRouter.RouteInfo.PLAYBACK_TYPE_REMOTE
//                ) {
//                    outRoutes.add(route)
//                }
//            }
//            onRouteUpdate(outRoutes)
//        }
//
//        override fun onRouteAdded(router: MediaRouter, route: MediaRouter.RouteInfo) {
//            onFilteredRouteUpdate()
//        }
//
//        override fun onRouteChanged(router: MediaRouter, route: MediaRouter.RouteInfo) {
//            onFilteredRouteUpdate()
//        }
//
//        override fun onRouteRemoved(router: MediaRouter, route: MediaRouter.RouteInfo) {
//            onFilteredRouteUpdate()
//        }
//    }
//
//    internal abstract class Listener : CastStateListener, ChromecastSession.Listener {
//        abstract fun onReceiverAvailableUpdate(available: Boolean)
//        abstract fun onSessionRejoin(jsonSession: JSONObject?)
//
//        /** CastStateListener functions.  */
//        override fun onCastStateChanged(state: Int) {
//            onReceiverAvailableUpdate(state != CastState.NO_DEVICES_AVAILABLE)
//        }
//    }
//}