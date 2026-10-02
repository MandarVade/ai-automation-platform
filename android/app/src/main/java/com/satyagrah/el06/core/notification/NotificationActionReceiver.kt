package com.satyagrah.el06.core.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NotificationActionReceiver : BroadcastReceiver() {

    companion object {
        const val TAG = "NotificationAction"
        const val ACTION_RUN_WORKFLOW = "com.satyagrah.el06.ACTION_RUN_WORKFLOW"
        const val ACTION_PAUSE_WORKFLOW = "com.satyagrah.el06.ACTION_PAUSE_WORKFLOW"
        const val ACTION_CANCEL_WORKFLOW = "com.satyagrah.el06.ACTION_CANCEL_WORKFLOW"
        const val EXTRA_WORKFLOW_ID = "extra_workflow_id"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val workflowId = intent.getStringExtra(EXTRA_WORKFLOW_ID) ?: "default_wf"

        when (intent.action) {
            ACTION_RUN_WORKFLOW -> {
                Log.i(TAG, "Notification Action: RUN workflow $workflowId")
                // Start execution service or forward intent
            }
            ACTION_PAUSE_WORKFLOW -> {
                Log.i(TAG, "Notification Action: PAUSE workflow $workflowId")
            }
            ACTION_CANCEL_WORKFLOW -> {
                Log.i(TAG, "Notification Action: CANCEL workflow $workflowId")
            }
        }
    }
}
