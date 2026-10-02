package com.satyagrah.el06

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        // Handle notification permission result
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request POST_NOTIFICATIONS on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        setContent {
            EL06Theme {
                MainAppScreen()
            }
        }
    }
}

@Composable
fun EL06Theme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF0B0E14),
            surface = Color(0xFF161C29),
            primary = Color(0xFF3B82F6),
            secondary = Color(0xFF06B6D4)
        ),
        content = content
    )
}

enum class AndroidNavTab {
    HOME, CREATE, DETAIL, EXECUTION, ACTIVITY
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen() {
    var currentTab by remember { mutableStateOf(AndroidNavTab.HOME) }
    var selectedWorkflowName by remember { mutableStateOf("Smart Bill & Expense Processor") }
    var executionStatus by remember { mutableStateOf("STANDBY") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("EL-06 AI Automation", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("SATYAGRAH 2.0 • Android Native Runtime", fontSize = 11.sp, color = Color.Gray)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF10151F),
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF161C29)) {
                NavigationBarItem(
                    selected = currentTab == AndroidNavTab.HOME,
                    onClick = { currentTab = AndroidNavTab.HOME },
                    label = { Text("Home", fontSize = 10.sp) },
                    icon = { Text("⊞") }
                )
                NavigationBarItem(
                    selected = currentTab == AndroidNavTab.CREATE,
                    onClick = { currentTab = AndroidNavTab.CREATE },
                    label = { Text("Create", fontSize = 10.sp) },
                    icon = { Text("✦") }
                )
                NavigationBarItem(
                    selected = currentTab == AndroidNavTab.DETAIL,
                    onClick = { currentTab = AndroidNavTab.DETAIL },
                    label = { Text("Detail", fontSize = 10.sp) },
                    icon = { Text("☰") }
                )
                NavigationBarItem(
                    selected = currentTab == AndroidNavTab.EXECUTION,
                    onClick = { currentTab = AndroidNavTab.EXECUTION },
                    label = { Text("Monitor", fontSize = 10.sp) },
                    icon = { Text("▶") }
                )
                NavigationBarItem(
                    selected = currentTab == AndroidNavTab.ACTIVITY,
                    onClick = { currentTab = AndroidNavTab.ACTIVITY },
                    label = { Text("Activity", fontSize = 10.sp) },
                    icon = { Text("⏱") }
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFF0B0E14))
                .padding(16.dp)
        ) {
            when (currentTab) {
                AndroidNavTab.HOME -> HomeScreen(
                    onSelectWorkflow = { name ->
                        selectedWorkflowName = name
                        currentTab = AndroidNavTab.DETAIL
                    },
                    onRunWorkflow = { name ->
                        selectedWorkflowName = name
                        executionStatus = "RUNNING"
                        currentTab = AndroidNavTab.EXECUTION
                    }
                )
                AndroidNavTab.CREATE -> CreateScreen(
                    onPlanWorkflow = {
                        selectedWorkflowName = "Generated Automation"
                        currentTab = AndroidNavTab.DETAIL
                    }
                )
                AndroidNavTab.DETAIL -> DetailScreen(
                    workflowName = selectedWorkflowName,
                    onExecute = {
                        executionStatus = "RUNNING"
                        currentTab = AndroidNavTab.EXECUTION
                    }
                )
                AndroidNavTab.EXECUTION -> ExecutionScreen(
                    workflowName = selectedWorkflowName,
                    status = executionStatus
                )
                AndroidNavTab.ACTIVITY -> ActivityScreen()
            }
        }
    }
}

@Composable
fun HomeScreen(onSelectWorkflow: (String) -> Unit, onRunWorkflow: (String) -> Unit) {
    val workflows = listOf(
        "Smart Bill & Expense Processor (Finance)" to "Camera -> PaddleOCR -> Total -> Categorize -> Ledger",
        "Lecture Note & Quiz Synthesizer (Education)" to "Audio -> Whisper STT -> Concepts -> Notes -> 5 Quiz",
        "Plant Disease & Care Plan (Healthcare)" to "Camera -> AgroVision -> Treatment -> Care Plan Store"
    )

    Column {
        Text("Verified Automation Pipelines", fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 15.sp)
        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(workflows) { (name, desc) ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161C29)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Text(desc, color = Color.Gray, fontSize = 11.sp, fontFamily = FontFamily.Monospace, modifier = Modifier.padding(vertical = 6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { onSelectWorkflow(name) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E2638))
                            ) {
                                Text("Inspect DAG", fontSize = 11.sp)
                            }
                            Button(
                                onClick = { onRunWorkflow(name) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1D4ED8))
                            ) {
                                Text("▶ Execute", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CreateScreen(onPlanWorkflow: () -> Unit) {
    var prompt by remember { mutableStateOf("Take a photo of my bill, extract items, calculate total and add to expense tracker.") }

    Column {
        Text("Natural Language Workflow Planner", fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 15.sp)
        Text("User defines WHAT. Platform autonomously decides HOW.", color = Color.Gray, fontSize = 12.sp)
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = prompt,
            onValueChange = { prompt = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Automation Prompt") }
        )
        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = onPlanWorkflow,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1D4ED8)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("✦ Analyze & Plan Workflow")
        }
    }
}

@Composable
fun DetailScreen(workflowName: String, onExecute: () -> Unit) {
    Column {
        Text(workflowName, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        Text("Validated Directed Acyclic Graph (Acyclic, Typed)", color = Color(0xFF10B981), fontSize = 11.sp)
        Spacer(modifier = Modifier.height(14.dp))

        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF161C29)), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("Pipeline Nodes:", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color.White)
                Text("1. Trigger (Camera / Audio)\n2. AI Model Step (OCR / STT / Vision)\n3. Data Transformation (Arithmetic / JSON)\n4. AI Classification / Synthesis\n5. Android Action (Ledger / File / Notification)", fontSize = 12.sp, color = Color(0xFFCBD5E1), modifier = Modifier.padding(vertical = 8.dp))
                Button(onClick = onExecute, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1D4ED8))) {
                    Text("▶ Run Workflow")
                }
            }
        }
    }
}

@Composable
fun ExecutionScreen(workflowName: String, status: String) {
    Column {
        Text("Execution Monitor", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        Text("Status: $status", color = Color(0xFF38BDF8), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
        Spacer(modifier = Modifier.height(12.dp))

        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF161C29)), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(workflowName, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Step 1: Trigger — SUCCESS (22ms)", color = Color(0xFF10B981), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                Text("Step 2: AI Inference — SUCCESS (420ms)", color = Color(0xFF10B981), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                Text("Step 3: Arithmetic Check — SUCCESS (4ms)", color = Color(0xFF10B981), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                Text("Step 4: Expense Ledger Store — SUCCESS (31ms)", color = Color(0xFF10B981), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
            }
        }
    }
}

@Composable
fun ActivityScreen() {
    Column {
        Text("Execution History & Audit", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(12.dp))

        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF161C29)), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("Smart Bill & Expense Processor", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                Text("Duration: 1240ms | Peak RAM: 140MB | Status: COMPLETED", color = Color.Gray, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
            }
        }
    }
}
