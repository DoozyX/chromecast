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
        'https://office-new-dev.uniqcast.com:12801/auth-streaming/3,4773a6541e59c39caae0df334a51a95239588e84,1709040027,slobodan,0-hrt2enkoder,8,8,8,8,8,8,8,8,DESKTOP,16242,all,none,default_basic,94.203.204.49/hls/stream/live/0-hrt2enkoder/index.m3u8',
  );
  final licenseController = TextEditingController(text: '');
  final jwtController = TextEditingController(text: '');
  final googleCastSender = GoogleCastSender();
  final devices = List<CastDevice>.empty(growable: true);
  bool connected = false;
  final positionController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GoogleCastSender Example')),
      body: Center(
        child: ListView(
          children: [
            if (!connected) ...[
              ElevatedButton(
                onPressed: () async {
                  final devices = await googleCastSender.listDevices();
                  for (final device in devices) {
                    print(device.name);
                  }
                  setState(() {
                    this.devices.clear();
                    this.devices.addAll(devices);
                  });
                },
                child: const Text('Cast'),
              ),
              ListView(
                shrinkWrap: true,
                children: devices
                    .map(
                      (device) => ListTile(
                        title: Text(device.name),
                        onTap: () async {
                          await googleCastSender.connect(device.id);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: Theme.of(context).primaryColor,
                                content: Text('connecting to ${device.name}'),
                              ),
                            );
                            // ignore: inference_failure_on_instance_creation
                            await Future.delayed(const Duration(seconds: 2));
                            setState(() {
                              connected = true;
                            });
                          }
                        },
                      ),
                    )
                    .toList(),
              ),
            ],
            if (connected) ...[
              ElevatedButton(
                onPressed: () async {
                  setState(() {
                    connected = false;
                  });
                  await googleCastSender.listDevices();
                },
                child: const Text('Disconnect'),
              ),
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
                  if (license.isNotEmpty && jwt.isNotEmpty) {
                    googleCastSender.load(url, license, jwt);
                  } else {
                    googleCastSender.load(url);
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
              ElevatedButton(
                onPressed: googleCastSender.pause,
                child: const Text('Pause'),
              ),
              ElevatedButton(
                onPressed: googleCastSender.play,
                child: const Text('Play'),
              ),
              TextField(
                controller: positionController,
                decoration: const InputDecoration(labelText: 'position'),
              ),
              ElevatedButton(
                onPressed: () {
                  final position = int.tryParse(positionController.text);
                  if (position != null) {
                    googleCastSender.seek(position);
                  }
                },
                child: const Text('Seek'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
