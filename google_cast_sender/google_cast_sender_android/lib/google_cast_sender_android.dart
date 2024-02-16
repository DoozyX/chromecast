import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

/// The Android implementation of [GoogleCastSenderPlatform].
class GoogleCastSenderAndroid extends GoogleCastSenderPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('google_cast_sender_android');

  /// Registers this class as the default instance of [GoogleCastSenderPlatform]
  static void registerWith() {
    GoogleCastSenderPlatform.instance = GoogleCastSenderAndroid();
  }

  @override
  Future<String?> getPlatformName() {
    return methodChannel.invokeMethod<String>('getPlatformName');
  }
}
