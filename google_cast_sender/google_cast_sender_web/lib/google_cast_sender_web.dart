import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

/// The Web implementation of [GoogleCastSenderPlatform].
class GoogleCastSenderWeb extends GoogleCastSenderPlatform {
  /// Registers this class as the default instance of [GoogleCastSenderPlatform]
  static void registerWith([Object? registrar]) {
    GoogleCastSenderPlatform.instance = GoogleCastSenderWeb();
  }

  @override
  Future<String?> getPlatformName() async => 'Web';
}
