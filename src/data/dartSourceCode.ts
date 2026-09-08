export interface DartFile {
  name: string;
  path: string;
  description: string;
  code: string;
}

export const DART_FILES: DartFile[] = [
  {
    name: 'pubspec.yaml',
    path: 'pubspec.yaml',
    description: 'Flutter dependencies & asset configuration',
    code: `name: smart_kabadi
description: "AI-powered vernacular e-waste recycling and weighing app for scrap collectors."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  google_fonts: ^6.1.0
  camera: ^0.10.5+9
  flutter_tts: ^3.8.5
  qr_flutter: ^4.1.0
  confetti: ^0.7.0
  intl: ^0.19.0
  vibration: ^1.8.4
  cached_network_image: ^3.3.1
  material_symbols_icons: ^4.2760.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    name: 'main.dart',
    path: 'lib/main.dart',
    description: 'Application entry point & custom Material theme matching the design system',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/home_dashboard.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SmartKabadiApp());
}

class SmartKabadiApp extends StatelessWidget {
  const SmartKabadiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartKabadi',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF7F9FB),
        colorScheme: const ColorScheme(
          brightness: Brightness.light,
          primary: Color(0xFF006948),
          onPrimary: Colors.white,
          primaryContainer: Color(0xFF00855D),
          onPrimaryContainer: Color(0xFFF5FFF7),
          secondary: Color(0xFF565E74),
          onSecondary: Colors.white,
          secondaryContainer: Color(0xFFDAE2FD),
          onSecondaryContainer: Color(0xFF5C647A),
          tertiary: Color(0xFF8D4B00),
          onTertiary: Colors.white,
          tertiaryContainer: Color(0xFFB15F00),
          onTertiaryContainer: Color(0xFFFFF7F0),
          error: Color(0xFFBA1A1A),
          onError: Colors.white,
          errorContainer: Color(0xFFFFDAD6),
          onErrorContainer: Color(0xFF93000A),
          surface: Color(0xFFF7F9FB),
          onSurface: Color(0xFF191C1E),
          surfaceContainerLowest: Colors.white,
          surfaceContainerLow: Color(0xFFF2F4F6),
          surfaceContainer: Color(0xFFECEEF0),
          surfaceContainerHigh: Color(0xFFE6E8EA),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          Theme.of(context).textTheme,
        ),
      ),
      home: const HomeDashboardScreen(),
    );
  }
}
`,
  },
  {
    name: 'home_dashboard.dart',
    path: 'lib/screens/home_dashboard.dart',
    description: 'Home Dashboard screen with Live Rates, Scanner CTA, and Quick Weighing',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'camera_scanner.dart';
import 'scrap_weighing.dart';

class HomeDashboardScreen extends StatefulWidget {
  const HomeDashboardScreen({super.key});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _currentNavIndex = 0;
  double _quickWeight = 15.0;
  final int _ratePerKg = 280;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(88),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF7F9FB).withOpacity(0.95),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFF006948),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.recycling, color: Colors.white, size: 24),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'SmartKabadi',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF191C1E),
                                ),
                              ),
                              Text(
                                'Home Dashboard',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF006948),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.volume_up, size: 18, color: Color(0xFF8D4B00)),
                            label: Text(
                              'सुनो',
                              style: GoogleFonts.plusJakartaSans(
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF2F1500),
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFFDCC3),
                              elevation: 0,
                              shape: const StadiumBorder(),
                            ),
                          ),
                          const SizedBox(width: 6),
                          const CircleAvatar(
                            radius: 16,
                            backgroundColor: Color(0xFF006948),
                            child: Icon(Icons.person, color: Colors.white, size: 18),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF006948),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'ऑनलाइन Online',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF006948),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE6E8EA),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF006948),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Text('HI हिंदी', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8),
                              child: Text('EN', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Voice Assist Banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFDCC3),
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(color: Colors.black, offset: Offset(0, 4)),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          color: Color(0xFF8D4B00),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.volume_up, color: Colors.white, size: 26),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('आवाज़ से सुनें', style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800)),
                          Text('Tap to hear instructions', style: GoogleFonts.plusJakartaSans(fontSize: 12, color: const Color(0xFF6E3900))),
                        ],
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.mic, size: 20, color: Color(0xFFFFDCC3)),
                    label: const Text('बोलें', style: TextStyle(color: Color(0xFFFFDCC3), fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2F1500),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Hero CTA: Scan E-Waste Camera
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const CameraScannerScreen()));
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF00855D),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [
                    BoxShadow(color: Color(0xFF002114), offset: Offset(0, 6)),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.photo_camera, color: Color(0xFF006948), size: 32),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('कचरा स्कैन करें', style: GoogleFonts.plusJakartaSans(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                Text('SCAN E-WASTE', style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF85F8C4))),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF85F8C4),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text('⚡ तुरंत भाव', style: TextStyle(color: Color(0xFF002114), fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.center_focus_strong, color: Color(0xFF85F8C4), size: 20),
                              SizedBox(width: 6),
                              Text('कैमरा खोलें और तुरंत दाम जानें', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                            ],
                          ),
                          const CircleAvatar(
                            radius: 14,
                            backgroundColor: Color(0xFF85F8C4),
                            child: Icon(Icons.arrow_forward, size: 16, color: Color(0xFF002114)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Earnings Summary Grid (Side by Side)
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: const [BoxShadow(color: Color(0xFF191C1E), offset: Offset(0, 4))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF85F8C4),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.payments, color: Color(0xFF002114), size: 22),
                            ),
                            const Icon(Icons.volume_up, size: 20, color: Color(0xFF8D4B00)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('₹14,850', style: GoogleFonts.spaceGrotesk(fontSize: 26, fontWeight: FontWeight.w700, color: const Color(0xFF006948))),
                        Text('कुल कमाई', style: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.w800)),
                        Text('Total Earned', style: GoogleFonts.plusJakartaSans(fontSize: 12, color: const Color(0xFF565E74))),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: const [BoxShadow(color: Color(0xFF191C1E), offset: Offset(0, 4))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFDAE2FD),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.scale, color: Color(0xFF131B2E), size: 22),
                            ),
                            const Icon(Icons.volume_up, size: 20, color: Color(0xFF565E74)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('480 KG', style: GoogleFonts.spaceGrotesk(fontSize: 26, fontWeight: FontWeight.w700, color: const Color(0xFF565E74))),
                        Text('बेचा गया माल', style: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.w800)),
                        Text('Waste Sold', style: GoogleFonts.plusJakartaSans(fontSize: 12, color: const Color(0xFF565E74))),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Live Rates Header & Ticker
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('आज का भाव (Live Rates)', style: GoogleFonts.plusJakartaSans(fontSize: 17, fontWeight: FontWeight.w800)),
                    Text('सीधे रीसाइक्लर केंद्र से सत्यापित', style: GoogleFonts.plusJakartaSans(fontSize: 12, color: const Color(0xFF565E74))),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.volume_up, size: 16, color: Color(0xFF8D4B00)),
                  label: const Text('भाव सुनें', style: TextStyle(color: Color(0xFF2F1500), fontSize: 13, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFDCC3),
                    elevation: 0,
                    shape: const StadiumBorder(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Scrap Rate Card 1: PCB Motherboard
            _buildRateTile(
              title: 'PCB मदरबोर्ड',
              subtitle: 'Computer / Mobile Board',
              rate: '₹280',
              trend: '▲ +₹15 चढ़ा',
              imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAepkrxZACyHS-cL9Gh3nwH-dxWBCvciKiMuuRuPk-uMZM-A3zIYyG5wtT60X4-KCwUfFd4qdRfzXonsGJ_hOOJxYOHRs-fuCqPKfXmo2kLNiIxZdcY-qMBbne0p4zn_mId-K2fGQ_Kz7n1-N2VsAFPOaqC313XrLl1bjKSZEYTjuGvruWyfhXGL57WlZ0tkfr3OutxfF7tqkWwg5lzxBGnoYwHxmDdsrrxjoxGf_UzbMuv4gNMrkIK',
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ScrapWeighingScreen()));
              },
            ),
            const SizedBox(height: 8),

            // Scrap Rate Card 2: Copper
            _buildRateTile(
              title: 'तांबा तार (Copper)',
              subtitle: 'Bright Wire Stripped',
              rate: '₹540',
              trend: '▲ +₹20 चढ़ा',
              imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjyghBELdYp30RmskQLVrn8xLWPGVnC751fQ0HGldnv9b_yRao3Yq6Fn0z45gkS4uE3vuQK5FHXqElmGeyt5QvJh09mU1SwKTdeY3HR6molaUaEQ0zZ9TmfU1wv5yxuDiGhLHLgIslDJ3j-6GFi38NQbi0OH8UVAPwSaAywU5rTBHmfPdh8WMQf64GSLbdNchksU63MQdfxPLpwSVVBPtf5mx3CUWHAlRkCw-2ETVvVm_Ae1m5iFp_',
            ),
            const SizedBox(height: 8),

            // Scrap Rate Card 3: Li-Ion Battery
            _buildRateTile(
              title: 'बैटरी (Li-ion)',
              subtitle: 'Mobile & Laptop Pack',
              rate: '₹120',
              trend: 'स्थिर (Stable)',
              imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsina9efgFnY9OS4st0mySgGdZtjC4iRnPIAXF-1DUl3zSgTE2DVX-7Z8RFyjyRnCATHxdQpVabb-B8dWBTVjcwpNYaOZR4ErQPSMfK7V78jQ9ZkcmLJ7LkF_w93iUuQFuZbasRgnIVRljPtY5ATp7CO-NBYaDrNcEfFagA-PSCsiuODB7rm5qaXkuBDFLElElNzTpKb-eO0-AJeN5-1qHrHtqHd_bSUPhSo7c5x4J14ePVDExXa83',
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentNavIndex,
        onTap: (i) => setState(() => _currentNavIndex = i),
        selectedItemColor: const Color(0xFF006948),
        unselectedItemColor: const Color(0xFF565E74),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'घर (Home)'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'खाता (Ledger)'),
          BottomNavigationBarItem(icon: Icon(Icons.support_agent), label: 'मदद (Support)'),
        ],
      ),
    );
  }

  Widget _buildRateTile({
    required String title,
    required String subtitle,
    required String rate,
    required String trend,
    required String imageUrl,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [BoxShadow(color: Color(0xFF191C1E), offset: Offset(0, 3))],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(imageUrl, width: 56, height: 56, fit: BoxFit.cover),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w700)),
                  Text(subtitle, style: GoogleFonts.plusJakartaSans(fontSize: 12, color: const Color(0xFF565E74))),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  children: [
                    Text(rate, style: GoogleFonts.spaceGrotesk(fontSize: 22, fontWeight: FontWeight.w700, color: const Color(0xFF006948))),
                    const Text('/KG', style: TextStyle(color: Color(0xFF006948), fontWeight: FontWeight.bold)),
                  ],
                ),
                Text(trend, style: const TextStyle(fontSize: 11, color: Color(0xFF006948), fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    name: 'camera_scanner.dart',
    path: 'lib/screens/camera_scanner.dart',
    description: 'Realtime AI Camera Scanner with laser beam, reticle, voice triggers, and shutter',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'safety_modal.dart';
import 'scrap_weighing.dart';

class CameraScannerScreen extends StatefulWidget {
  const CameraScannerScreen({super.key});

  @override
  State<CameraScannerScreen> createState() => _CameraScannerScreenState();
}

class _CameraScannerScreenState extends State<CameraScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _scanController;
  bool _torchOn = true;

  @override
  void initState() {
    super.initState();
    _scanController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _scanController.dispose();
    super.dispose();
  }

  void _onCapture() {
    // Show safety modal if battery, else proceed to weighing
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SafetyHazardModal(
        onProceed: () {
          Navigator.pop(context);
          Navigator.push(context, MaterialPageRoute(builder: (_) => const ScrapWeighingScreen()));
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text('सामान स्कैन करें', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.volume_up, color: Color(0xFF8D4B00)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Realtime Viewfinder
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: Colors.black,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfGgb9PtkTWCdZx1VMNXHvVIFIYZkbVEWwwO43a6eraeEdUY0AuodNEvojSrgf_jlxFF8u1KtSENUiIpvT_9uJr87Y6wDWXKauQzxg7gy-9Ja-lo8FddSydt3RS6Ocfu8_lkn00ngCADu4fKiMfduDMD303xrCBhf0SBxuzC0XpJNLPEv6xKiXaQ22pmVd-PqpWtaK3KX8oUtUGoMoQ0OmPXkrq_7mzmhUI8EoOsUFmSwQus_7PFNr',
                      fit: BoxFit.cover,
                    ),
                    // Neon Laser Beam Animation
                    AnimatedBuilder(
                      animation: _scanController,
                      builder: (context, child) {
                        return Positioned(
                          top: _scanController.value * 340 + 40,
                          left: 0,
                          right: 0,
                          child: Container(
                            height: 3,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Colors.transparent, Color(0xFF85F8C4), Colors.transparent],
                              ),
                              boxShadow: [
                                BoxShadow(color: const Color(0xFF85F8C4).withOpacity(0.8), blurRadius: 10),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    // Reticle Corner Brackets & Identified tag
                    Center(
                      child: Container(
                        width: 240,
                        height: 240,
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFF85F8C4), width: 2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Icons.filter_center_focus, size: 48, color: Color(0xFF85F8C4)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Shutter Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                IconButton(
                  icon: const Icon(Icons.photo_library, size: 30),
                  onPressed: () {},
                ),
                GestureDetector(
                  onTap: _onCapture,
                  child: Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF85F8C4), width: 4),
                      color: const Color(0xFF006948),
                    ),
                    child: const Icon(Icons.photo_camera, color: Colors.white, size: 36),
                  ),
                ),
                IconButton(
                  icon: Icon(_torchOn ? Icons.flashlight_on : Icons.flashlight_off, size: 30),
                  onPressed: () => setState(() => _torchOn = !_torchOn),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    name: 'scrap_weighing.dart',
    path: 'lib/screens/scrap_weighing.dart',
    description: 'New Scrap Weighing screen with dynamic payout calculation and recycler selector',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'receipt_screen.dart';

class ScrapWeighingScreen extends StatefulWidget {
  const ScrapWeighingScreen({super.key});

  @override
  State<ScrapWeighingScreen> createState() => _ScrapWeighingScreenState();
}

class _ScrapWeighingScreenState extends State<ScrapWeighingScreen> {
  double _weight = 15.5;
  int _rate = 300;

  int get _totalPayout => (_weight * _rate).round();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: Text('New Scrap Weighing', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.volume_up, color: Color(0xFF8D4B00))),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Identified PCB Material Card
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhNw2JUBBbKmcJhnVICbEIM50tifknxYlGZ16C1LxX-WuBmpDQDn0FiI0hI6ZQOP2D7IuQdhEfFjJ4xx-46IjPTSAJEKR3SXFsn73j6b3e6f5rtUf76lxKhIKn1DKiIdoMQKqiUd_eK7QL9DE-vG8aOxFI8zhZrJjh6WkV5yI3pGip_ueXlByqumn_BVbcsX4C6a6mls66rmq5hrRlmamiqbUU6NvOr7rp8GW7WgAmbdJUDs2Vduy',
                      width: 64,
                      height: 64,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF85F8C4),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text('AI स्कैन सफल (Grade A)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 4),
                        Text('प्रिंटेड सर्किट बोर्ड (PCB)', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 16)),
                        Text('₹280 – ₹310 / किलो (KG)', style: TextStyle(color: const Color(0xFF006948), fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Stepper Weight Control
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      IconButton(
                        onPressed: () {
                          if (_weight > 0.5) setState(() => _weight -= 0.5);
                        },
                        icon: const Icon(Icons.remove_circle, size: 48, color: Color(0xFF565E74)),
                      ),
                      Column(
                        children: [
                          Text('\${_weight.toStringAsFixed(1)} KG', style: GoogleFonts.spaceGrotesk(fontSize: 36, fontWeight: FontWeight.w700)),
                          const Text('तौल सत्यापित', style: TextStyle(color: Color(0xFF006948), fontWeight: FontWeight.bold)),
                        ],
                      ),
                      IconButton(
                        onPressed: () {
                          setState(() => _weight += 0.5);
                        },
                        icon: const Icon(Icons.add_circle, size: 48, color: Color(0xFF006948)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Total Payout Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF006948),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('कुल मिलने वाली रकम (TOTAL)', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            Text('₹\$_totalPayout', style: GoogleFonts.spaceGrotesk(fontSize: 32, fontWeight: FontWeight.w700, color: Colors.white)),
                          ],
                        ),
                        Text('\${_weight} KG × ₹\$_rate', style: const TextStyle(color: Color(0xFF85F8C4), fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        color: Colors.white,
        child: ElevatedButton(
          onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const TransactionReceiptScreen()));
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF006948),
            padding: const EdgeInsets.symmetric(vertical: 18),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: Text('डील पक्की करें & हैंडओवर ₹\$_totalPayout', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
`,
  },
  {
    name: 'receipt_screen.dart',
    path: 'lib/screens/receipt_screen.dart',
    description: 'Transaction Detail Receipt screen with QR code and ledger summary',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';

class TransactionReceiptScreen extends StatelessWidget {
  const TransactionReceiptScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: Text('Transaction Detail Receipt', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 36,
              backgroundColor: Color(0xFF006948),
              child: Icon(Icons.check, color: Colors.white, size: 44),
            ),
            const SizedBox(height: 12),
            Text('सौदा पक्का!', style: GoogleFonts.plusJakartaSans(fontSize: 26, fontWeight: FontWeight.w900, color: const Color(0xFF006948))),
            Text('Deal Logged Successfully (#TXN-89421)', style: GoogleFonts.plusJakartaSans(color: const Color(0xFF565E74), fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),

            // Scannable QR Code Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
              ),
              child: Column(
                children: [
                  const Text('डिजिटल हैंडओवर पास', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  const SizedBox(height: 12),
                  QrImageView(
                    data: 'KABADIWALA-TXN-89421|AMOUNT:4650|WEIGHT:15.5KG|DATE:2026-09-07',
                    version: QrVersions.auto,
                    size: 200.0,
                  ),
                  const SizedBox(height: 12),
                  const Text('रिसाइक्लर को यह कोड स्कैन करवाएं', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const Text('Show this QR code to the recycler to complete handover', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Split Ledger
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF00855D),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('कबाड़ीवाला (YOU)', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      Text('नकद / UPI बिक्री राशि', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Text('₹4,650', style: GoogleFonts.spaceGrotesk(fontSize: 26, fontWeight: FontWeight.w700, color: Colors.white)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.popUntil(context, (route) => route.isFirst),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF006948),
                minimumSize: const Size.fromHeight(56),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('मुख्य स्क्रीन पर जाएं (Home)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    name: 'safety_modal.dart',
    path: 'lib/screens/safety_modal.dart',
    description: 'Hazardous Material Safety bottom sheet with handling warnings',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SafetyHazardModal extends StatefulWidget {
  final VoidCallback onProceed;

  const SafetyHazardModal({super.key, required this.onProceed});

  @override
  State<SafetyHazardModal> createState() => _SafetyHazardModalState();
}

class _SafetyHazardModalState extends State<SafetyHazardModal> {
  bool _acknowledged = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFFDAD6),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                const Icon(Icons.warning, color: Color(0xFFBA1A1A), size: 36),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('सावधानी! खतरनाक सामान', style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF93000A))),
                      const Text('HAZARDOUS MATERIAL DETECTED', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFBA1A1A))),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          CheckboxListTile(
            value: _acknowledged,
            onChanged: (v) => setState(() => _acknowledged = v ?? false),
            title: const Text('मैंने खतरे को समझ लिया है (I have read the hazard warning)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _acknowledged ? widget.onProceed : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF006948),
              minimumSize: const Size.fromHeight(54),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('समझ गया, आगे बढ़ें', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    name: 'role_login_screen.dart',
    path: 'lib/screens/role_login_screen.dart',
    description: 'Role authentication: Log in as Kabadiwala or Log in as Recycler',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

enum UserRole { kabadiwala, recycler }

class RoleLoginScreen extends StatefulWidget {
  final Function(UserRole role) onLoginSuccess;

  const RoleLoginScreen({Key? key, required this.onLoginSuccess}) : super(key: key);

  @override
  State<RoleLoginScreen> createState() => _RoleLoginScreenState();
}

class _RoleLoginScreenState extends State<RoleLoginScreen> {
  UserRole _selectedRole = UserRole.kabadiwala;
  final TextEditingController _phoneController = TextEditingController(text: '9876543210');
  final TextEditingController _cpcbController = TextEditingController(text: 'CPCB-DL-8891-EW');
  bool _otpSent = false;
  final TextEditingController _otpController = TextEditingController(text: '4829');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              Center(
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF006948),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.recycling, color: Colors.white, size: 36),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(
                  'SmartKabadi',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF191C1E),
                  ),
                ),
              ),
              const Center(
                child: Text(
                  'कृपया अपनी भूमिका चुनें (Select Login Role)',
                  style: TextStyle(fontSize: 13, color: Color(0xFF565E74), fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 24),

              // Option 1: Log in as Kabadiwala
              _buildRoleOption(
                role: UserRole.kabadiwala,
                icon: Icons.inventory_2,
                title: 'कबाड़ीवाला (Kabadiwala)',
                subtitle: 'कबाड़ संग्राहक व विक्रेता (Scrap Collector & Seller)',
                description: 'सामान स्कैन करें, वजन तौलें और तत्काल सरकारी मंडी भाव प्राप्त करें।',
                badgeText: 'AI कैमरा & कांटा',
              ),

              const SizedBox(height: 12),

              // Option 2: Log in as Recycler
              _buildRoleOption(
                role: UserRole.recycler,
                icon: Icons.factory,
                title: 'रीसाइक्लर (Recycler)',
                subtitle: 'CPCB अधिकृत थोक खरीदार (Authorized Scrap Buyer)',
                description: 'कबाड़ीवालों के क्यूआर टोकन स्कैन करें, ई-कचरा स्वीकारें और लाइव भाव नियंत्रित करें।',
                badgeText: 'टोकन स्कैनर & मंडी भाव',
              ),

              const SizedBox(height: 24),

              // Phone & OTP Form
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF191C1E), width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _selectedRole == UserRole.kabadiwala
                          ? 'कबाड़ीवाला मोबाइल लॉगिन'
                          : 'रीसाइक्लर लाइसेंस लॉगिन',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        prefixText: '+91 ',
                        labelText: 'मोबाइल नंबर (Mobile)',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                    if (_selectedRole == UserRole.recycler) ...[
                      const SizedBox(height: 12),
                      TextField(
                        controller: _cpcbController,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.badge),
                          labelText: 'CPCB पंजीकरण संख्या (License ID)',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                      ),
                    ],
                    if (_otpSent) ...[
                      const SizedBox(height: 12),
                      TextField(
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        decoration: const InputDecoration(
                          labelText: '4-अंकों का ओटीपी (Demo: 4829)',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        if (!_otpSent) {
                          setState(() => _otpSent = true);
                        } else {
                          widget.onLoginSuccess(_selectedRole);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF006948),
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        _otpSent
                            ? 'सत्यापित करें व लॉगिन करें'
                            : _selectedRole == UserRole.kabadiwala
                                ? 'कबाड़ीवाला के रूप में लॉगिन करें'
                                : 'रीसाइक्लर के रूप में लॉगिन करें',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleOption({
    required UserRole role,
    required IconData icon,
    required String title,
    required String subtitle,
    required String description,
    required String badgeText,
  }) {
    final isSelected = _selectedRole == role;
    return InkWell(
      onTap: () => setState(() => _selectedRole = role),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : const Color(0xFFF2F4F6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF006948) : Colors.transparent,
            width: isSelected ? 2.5 : 1,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF006948) : const Color(0xFFE0E3E5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: isSelected ? Colors.white : const Color(0xFF565E74)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Icon(
                        isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                        color: isSelected ? const Color(0xFF006948) : const Color(0xFFBCCAC0),
                        size: 20,
                      ),
                    ],
                  ),
                  Text(subtitle, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF006948))),
                  const SizedBox(height: 4),
                  Text(description, style: const TextStyle(fontSize: 12, color: Color(0xFF565E74))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    name: 'app_translations.dart',
    path: 'lib/localization/app_translations.dart',
    description: 'Vernacular translation strings for Hindi, English, and Marathi',
    code: `enum AppLanguage { hi, en, mr }

class AppTranslations {
  static const Map<AppLanguage, Map<String, String>> strings = {
    AppLanguage.hi: {
      'appName': 'SmartKabadi',
      'kabadiTitle': 'कबाड़ीवाला डैशबोर्ड',
      'recyclerTitle': 'रीसाइक्लर पोर्टल',
      'scanWaste': 'कचरा स्कैन करें',
      'liveRates': 'सरकारी लाइव मंडी भाव',
      'quickCalc': 'त्वरित मूल्य कैलकुलेटर',
      'scanQrToken': 'कबाड़ीवाला टोकन स्कैन करें',
    },
    AppLanguage.en: {
      'appName': 'SmartKabadi',
      'kabadiTitle': 'Collector Dashboard',
      'recyclerTitle': 'Authorized Recycler Intake',
      'scanWaste': 'Scan Scrap Item',
      'liveRates': 'Official Mandi Rates',
      'quickCalc': 'Instant Price Estimator',
      'scanQrToken': 'Scan Collector QR Token',
    },
    AppLanguage.mr: {
      'appName': 'SmartKabadi',
      'kabadiTitle': 'कबाडीवाला डॅशबोर्ड',
      'recyclerTitle': 'अधिकृत रिसायकलर पोर्टल',
      'scanWaste': 'ई-कचरा स्कॅन करा',
      'liveRates': 'शासकीय थेट बाजार भाव',
      'quickCalc': 'झटपट मूल्य कॅल्क्युलेटर',
      'scanQrToken': 'कबाडीवाला क्यूआर टोकन स्कॅन करा',
    },
  };

  static String tr(String key, AppLanguage lang) {
    return strings[lang]?[key] ?? key;
  }
}
`,
  },
  {
    name: 'recycler_dashboard.dart',
    path: 'lib/screens/recycler_dashboard.dart',
    description: 'Recycler portal screen with token intake and Marathi/English/Hindi language support',
    code: `import 'package:flutter/material.dart';
import '../localization/app_translations.dart';

class RecyclerDashboardScreen extends StatefulWidget {
  final AppLanguage language;
  const RecyclerDashboardScreen({super.key, this.language = AppLanguage.hi});

  @override
  State<RecyclerDashboardScreen> createState() => _RecyclerDashboardScreenState();
}

class _RecyclerDashboardScreenState extends State<RecyclerDashboardScreen> {
  late AppLanguage _lang;

  @override
  void initState() {
    super.initState();
    _lang = widget.language;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppTranslations.tr('recyclerTitle', _lang)),
        backgroundColor: const Color(0xFF006948),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Text('Recycler Portal - \${_lang.name.toUpperCase()}'),
      ),
    );
  }
}
`,
  },
];
