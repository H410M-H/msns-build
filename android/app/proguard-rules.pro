# Preserve Line Numbers and Source File attributes for clean stack traces
-keepattributes SourceFile,LineNumberTable

# Ignore missing optional class warnings (e.g. Firebase ktx)
-dontwarn **

# Preserve Capacitor native bridge & JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.getcapacitor.** { *; }
-keep class com.msns.lms.** { *; }

# Preserve Firebase classes
-keep class com.google.firebase.** { *; }

# Preserve SQLite & Cordova plugins
-keep class io.sqlc.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.capacitorcommunity.** { *; }
