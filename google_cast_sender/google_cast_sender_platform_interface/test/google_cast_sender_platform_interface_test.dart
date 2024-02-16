import 'package:flutter_test/flutter_test.dart';
import 'package:google_cast_sender_platform_interface/google_cast_sender_platform_interface.dart';

class GoogleCastSenderMock extends GoogleCastSenderPlatform {
  static const mockPlatformName = 'Mock';

  @override
  Future<String?> getPlatformName() async => mockPlatformName;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  group('GoogleCastSenderPlatformInterface', () {
    late GoogleCastSenderPlatform googleCastSenderPlatform;

    setUp(() {
      googleCastSenderPlatform = GoogleCastSenderMock();
      GoogleCastSenderPlatform.instance = googleCastSenderPlatform;
    });

    group('getPlatformName', () {
      test('returns correct name', () async {
        expect(
          await GoogleCastSenderPlatform.instance.getPlatformName(),
          equals(GoogleCastSenderMock.mockPlatformName),
        );
      });
    });
  });
}
