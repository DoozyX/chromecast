import 'package:flutter_test/flutter_test.dart';
// import 'package:google_cast_sender/google_cast_sender.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';
import 'package:mocktail/mocktail.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class MockGoogleCastSenderPlatform extends Mock
    with MockPlatformInterfaceMixin
    implements GoogleCastSenderPlatform {}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GoogleCastSender', () {
    late GoogleCastSenderPlatform googleCastSenderPlatform;

    setUp(() {
      googleCastSenderPlatform = MockGoogleCastSenderPlatform();
      GoogleCastSenderPlatform.instance = googleCastSenderPlatform;
    });

    // group('getPlatformName', () {
    //   test('returns correct name when platform implementation exists',
    //       () async {
    //     const platformName = '__test_platform__';
    //     when(
    //       () => googleCastSenderPlatform.getPlatformName(),
    //     ).thenAnswer((_) async => platformName);

    //     final actualPlatformName = await getPlatformName();
    //     expect(actualPlatformName, equals(platformName));
    //   });

    //   test('throws exception when platform implementation is missing',
    //       () async {
    //     when(
    //       () => googleCastSenderPlatform.getPlatformName(),
    //     ).thenAnswer((_) async => null);

    //     expect(getPlatformName, throwsException);
    //   });
    // });
  });
}
