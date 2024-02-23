package com.doozyx.plugins.google_cast_sender

import android.content.Context
import android.util.Log
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodChannel

class GoogleCastSenderPlugin : FlutterPlugin {
  private lateinit var channel: MethodChannel
  private var context: Context? = null
private var api: GoogleCastSenderApiImplementation? = null
  override fun onAttachedToEngine(
      flutterPluginBinding: FlutterPlugin.FlutterPluginBinding
  ) {
    api = GoogleCastSenderApiImplementation()
    GoogleCastSenderApi.setUp(flutterPluginBinding.binaryMessenger, api)
    context = flutterPluginBinding.applicationContext
  }

  override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
    GoogleCastSenderApi.setUp(binding.binaryMessenger, null)
    context = null
  }

  private class GoogleCastSenderApiImplementation : GoogleCastSenderApi {
    override fun init() {
      print("Init message")
    }

    override fun load(url: String, licenseUrl: String?, jwt: String?) {
      Log.d("TAG", "LOAD message")
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
