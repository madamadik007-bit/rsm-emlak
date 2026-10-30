plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "tr.com.rsmemlak"
    compileSdk = 35
    defaultConfig {
        applicationId = "tr.com.rsmemlak"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }
}
dependencies {
    implementation("androidx.activity:activity-ktx:1.10.1")
}
