const { withAndroidManifest } = require('expo/config-plugins');

function withAndroidWhatsAppQueries(config) {
  return withAndroidManifest(config, (config) => {
    const existingQueries = config.modResults.manifest.queries ?? [];

    config.modResults.manifest.queries = [
      ...existingQueries,
      {
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [{ $: { 'android:scheme': 'https', 'android:host': 'wa.me' } }],
          },
        ],
      },
      {
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [{ $: { 'android:scheme': 'whatsapp' } }],
          },
        ],
      },
      {
        package: [{ $: { 'android:name': 'com.whatsapp' } }],
      },
    ];

    return config;
  });
}

module.exports = withAndroidWhatsAppQueries;
