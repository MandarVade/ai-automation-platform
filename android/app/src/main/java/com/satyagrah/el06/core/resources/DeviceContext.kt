package com.satyagrah.el06.core.resources

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager

data class DeviceContext(
    val deviceModel: String,
    val androidVersion: Int,
    val totalRamMb: Int,
    val availableRamMb: Int,
    val batteryPercentage: Int,
    val isCharging: Boolean,
    val networkState: String,
    val hasNpu: Boolean,
    val hasGpu: Boolean,
    val powerSaverEnabled: Boolean,
    val allowCloudInference: Boolean = true
)

object AndroidDeviceManager {

    fun captureContext(context: Context): DeviceContext {
        val actMgr = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actMgr.getMemoryInfo(memInfo)

        val totalRamMb = (memInfo.totalMem / (1024 * 1024)).toInt()
        val availRamMb = (memInfo.availMem / (1024 * 1024)).toInt()

        // Battery
        val batteryIntent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: 80
        val scale = batteryIntent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: 100
        val batteryPct = if (level >= 0 && scale > 0) (level * 100) / scale else 80
        val status = batteryIntent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

        // Network
        val connMgr = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNet = connMgr.activeNetwork
        val caps = connMgr.getNetworkCapabilities(activeNet)
        val networkState = when {
            caps == null -> "OFFLINE"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WIFI_HIGH_SPEED"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "CELLULAR_4G_5G"
            else -> "OTHER"
        }

        // Power Saver
        val powerMgr = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val powerSaver = powerMgr.isPowerSaveMode

        return DeviceContext(
            deviceModel = "${Build.MANUFACTURER} ${Build.MODEL}",
            androidVersion = Build.VERSION.SDK_INT,
            totalRamMb = totalRamMb,
            availableRamMb = availRamMb,
            batteryPercentage = batteryPct,
            isCharging = isCharging,
            networkState = networkState,
            hasNpu = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q,
            hasGpu = true,
            powerSaverEnabled = powerSaver,
            allowCloudInference = true
        )
    }
}
