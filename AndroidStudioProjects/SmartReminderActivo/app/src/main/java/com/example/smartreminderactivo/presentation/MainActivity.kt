package com.example.smartreminderactive.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Text
import com.example.smartreminderactive.presentation.theme.SmartReminderActiveTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SmartReminderActiveTheme {
                WearApp()
            }
        }
    }
}

@Composable
fun WearApp() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black), // Fondo negro como base
        contentAlignment = Alignment.Center
    ) {
        // Imagen de fondo
        Image(
            painter = painterResource(id = R.drawable.background_wearable),
            contentDescription = "Background",
            modifier = Modifier.fillMaxSize()
        )

        // Contenido principal
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Botón 1: "ACTIVO"
            Button(
                onClick = { /* Acción al pulsar */ },
                modifier = Modifier.size(ButtonDefaults.LargeButtonSize)
            ) {
                Text(
                    text = "ACTIVO",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Botón 2: "Activarse Monitorear"
            Button(
                onClick = { /* Acción al pulsar */ },
                modifier = Modifier.size(ButtonDefaults.LargeButtonSize)
            ) {
                Text(
                    text = "Activarse Monitorear",
                    fontSize = 14.sp
                )
            }
        }
    }
}

@Preview(device = "id:wearos_small_round", showSystemUi = true)
@Composable
fun DefaultPreview() {
    SmartReminderActiveTheme {
        WearApp()
    }
}