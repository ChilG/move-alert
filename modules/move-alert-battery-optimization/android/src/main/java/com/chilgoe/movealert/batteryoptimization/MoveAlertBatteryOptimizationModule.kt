package com.chilgoe.movealert.batteryoptimization

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MoveAlertBatteryOptimizationModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private fun startSettingsActivity(intent: Intent): Boolean {
    return try {
      val activity = appContext.currentActivity

      if (activity != null) {
        activity.startActivity(intent)
      } else {
        context.startActivity(
          intent.apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          },
        )
      }

      true
    } catch (error: Exception) {
      false
    }
  }

  override fun definition() = ModuleDefinition {
    Name("MoveAlertBatteryOptimization")

    AsyncFunction("getStatusAsync") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        return@AsyncFunction "unsupported"
      }

      val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
        ?: return@AsyncFunction "unsupported"

      if (powerManager.isIgnoringBatteryOptimizations(context.packageName)) {
        "ignored"
      } else {
        "optimized"
      }
    }

    AsyncFunction("requestIgnoreBatteryOptimizationsAsync") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        return@AsyncFunction false
      }

      val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
        ?: return@AsyncFunction false

      if (powerManager.isIgnoringBatteryOptimizations(context.packageName)) {
        return@AsyncFunction true
      }

      val intent = Intent(
        Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
        Uri.parse("package:${context.packageName}"),
      )

      startSettingsActivity(intent)
    }

    AsyncFunction("openApplicationDetailsSettingsAsync") {
      val intent = Intent(
        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.parse("package:${context.packageName}"),
      )

      startSettingsActivity(intent)
    }
  }
}
