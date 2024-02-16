import 'package:flutter/foundation.dart' show visibleForTesting;
import 'package:flutter/services.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

/// An implementation of [GoogleCastSenderPlatform] that uses method channels.
class MethodChannelGoogleCastSender extends GoogleCastSenderPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('google_cast_sender');

  @override
  Future<String?> getPlatformName() {
    return methodChannel.invokeMethod<String>('getPlatformName');
  }
}
