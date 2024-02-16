import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

/// The iOS implementation of [GoogleCastSenderPlatform].
class GoogleCastSenderIOS extends GoogleCastSenderPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('google_cast_sender_ios');

  /// Registers this class as the default instance of [GoogleCastSenderPlatform]
  static void registerWith() {
    GoogleCastSenderPlatform.instance = GoogleCastSenderIOS();
  }

  @override
  Future<String?> getPlatformName() {
    return methodChannel.invokeMethod<String>('getPlatformName');
  }
}
