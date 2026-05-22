package com.chilgoe.movealert.batteryoptimization

import android.content.Context
import android.os.Build
import android.os.PowerManager
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MoveAlertBatteryOptimizationModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

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
  }
}
