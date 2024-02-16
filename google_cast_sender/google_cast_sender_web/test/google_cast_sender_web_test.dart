import 'package:flutter_test/flutter_test.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';
import 'package:google_cast_sender_web/google_cast_sender_web.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GoogleCastSenderWeb', () {
    const kPlatformName = 'Web';
    late GoogleCastSenderWeb googleCastSender;

    setUp(() async {
      googleCastSender = GoogleCastSenderWeb();
    });

    test('can be registered', () {
      GoogleCastSenderWeb.registerWith();
      expect(GoogleCastSenderPlatform.instance, isA<GoogleCastSenderWeb>());
    });

    test('getPlatformName returns correct name', () async {
      final name = await googleCastSender.getPlatformName();
      expect(name, equals(kPlatformName));
    });
  });
}
