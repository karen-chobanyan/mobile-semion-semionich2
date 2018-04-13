App.info({
  id: 'com.atero.bakerynew',
  name: 'Семён Семёныч',
  version: '0.3.01',
  description: 'Bakery management app',
  author: 'Atero Solutions',
  email: 'contact@atero.solutions',
  website: 'http://atero.solutions'
});

// Set up resources such as icons and launch screens.
App.icons({
  'android_mdpi': 'public/icon-48x48.png',
  'android_hdpi': 'public/icon-72x72.png',
  'android_xhdpi': 'public/icon-96x96.png',
});

App.launchScreens({
  'android_mdpi_landscape': 'public/bakery_luch_scr.png',
  'android_hdpi_landscape': 'public/bakery_luch_scr.png',
  'android_xhdpi_landscape': 'public/bakery_luch_scr.png'
});

App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('Orientation', 'landscape');
App.setPreference('Fullscreen', true);

App.setPreference('BackupWebStorage', 'local');
App.setPreference('StatusBarOverlaysWebView', 'true');
//App.setPreference('StatusBarBackgroundColor', '#000000');
App.setPreference('android-targetSdkVersion', '22');

App.accessRule('http://localhost:3000/*');
App.accessRule('https://localhost:3000/*');
App.accessRule('http://meteor.local');
App.accessRule('http://localhost:12664/');
App.accessRule('http://10.0.2.2:3000/*');
App.accessRule('http://10.35.3.197:3000/*');
App.accessRule('http://10.35.2.163:3000/*');
App.accessRule('http://192.168.2.4:3000/*');
App.accessRule('*.google.com/*');
App.accessRule('*.googleapis.com/*');
App.accessRule('*.gstatic.com/*');
