import 'package:flutter/material.dart';
import 'package:google_cast_sender/google_cast_sender.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: HomePage());
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final urlController = TextEditingController(
      text:
          "https://office-new-dev.uniqcast.com:12801/auth-streaming/3,23f43c2ff418c66386c0b446674c78bf65e23368,1708778904,slobodan,0-rtlenkoder,8,8,8,8,8,8,8,8,DESKTOP,16242,all,none,default_basic,94.203.204.49/hls/stream/live/0-rtlenkoder/index.m3u8");
  final licenseController = TextEditingController();
  final jwtController = TextEditingController();
  final positionController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GoogleCastSender Example')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: urlController,
              decoration: const InputDecoration(labelText: 'URL'),
            ),
            TextField(
              controller: licenseController,
              decoration: const InputDecoration(labelText: 'License'),
            ),
            TextField(
              controller: jwtController,
              decoration: const InputDecoration(labelText: 'JWT'),
            ),
            ElevatedButton(
              onPressed: () {
                final url = urlController.text;
                final license = licenseController.text;
                final jwt = jwtController.text;
                if (license.isNotEmpty || jwt.isNotEmpty) {
                  GoogleCastSender.load(url, license, jwt);
                } else {
                  GoogleCastSender.load(url);
                }
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: Theme.of(context).primaryColor,
                    content: const Text('loaded'),
                  ),
                );
              },
              child: const Text('Load'),
            ),
          ],
        ),
      ),
    );
  }
}
