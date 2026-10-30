package tr.com.rsmemlak

import android.app.Activity
import android.app.AlertDialog
import android.content.ContentValues
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private class RsmDb(activity: Activity) : SQLiteOpenHelper(activity, "rsm_emlak.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE people(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, identity TEXT, address TEXT, notes TEXT)")
        db.execSQL("CREATE TABLE properties(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, address TEXT, type TEXT, owner TEXT, notes TEXT)")
        db.execSQL("CREATE TABLE contracts(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, landlord TEXT, tenant TEXT, property TEXT, rent TEXT, signing_date TEXT, rent_start TEXT, rent_end TEXT, notes TEXT)")
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {}
    fun insert(table: String, values: ContentValues) = writableDatabase.insert(table, null, values)
    fun rows(table: String): List<Map<String, String>> {
        val out = mutableListOf<Map<String, String>>()
        readableDatabase.rawQuery("SELECT * FROM $table ORDER BY id DESC", null).use { c ->
            while (c.moveToNext()) {
                val row = linkedMapOf<String, String>()
                for (i in 0 until c.columnCount) row[c.getColumnName(i)] = c.getString(i) ?: ""
                out.add(row)
            }
        }
        return out
    }
    fun backup(): JSONObject {
        val root = JSONObject()
        for (table in listOf("people", "properties", "contracts")) {
            val array = JSONArray()
            rows(table).forEach { row ->
                val obj = JSONObject()
                row.filterKeys { it != "id" }.forEach { (k,v) -> obj.put(k,v) }
                array.put(obj)
            }
            root.put(table, array)
        }
        root.put("format", "rsm-emlak-backup-v1")
        root.put("createdAt", SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale("tr","TR")).format(Date()))
        return root
    }
    fun restore(root: JSONObject): Int {
        var count = 0
        val db = writableDatabase
        db.beginTransaction()
        try {
            for (table in listOf("people", "properties", "contracts")) {
                val arr = root.optJSONArray(table) ?: JSONArray()
                for (i in 0 until arr.length()) {
                    val obj = arr.optJSONObject(i) ?: continue
                    val cv = ContentValues()
                    val keys = obj.keys()
                    while (keys.hasNext()) {
                        val key = keys.next()
                        if (key != "id") cv.put(key, obj.optString(key, ""))
                    }
                    if (cv.size() > 0 && db.insert(table, null, cv) != -1L) count++
                }
            }
            db.setTransactionSuccessful()
        } finally { db.endTransaction() }
        return count
    }
}

class MainActivity : Activity() {
    private lateinit var db: RsmDb
    private lateinit var content: LinearLayout
    private lateinit var header: TextView
    private var section = "people"

    private val exportLauncher = registerForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        if (uri != null) try {
            contentResolver.openOutputStream(uri)?.bufferedWriter()?.use { it.write(db.backup().toString(2)) }
            toast("Yedek dosyası kaydedildi.")
        } catch (e: Exception) { toast("Yedek kaydedilemedi: ${e.message}") }
    }
    private val importLauncher = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) try {
            val text = contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() } ?: ""
            val root = JSONObject(text)
            if (root.optString("format") != "rsm-emlak-backup-v1") { toast("Bu dosya RSM-EMLAK yedeği değil."); return@registerForActivityResult }
            val count = db.restore(root)
            render()
            toast("$count kayıt eklendi. Mevcut kayıtlar silinmedi.")
        } catch (e: Exception) { toast("Yedek açılamadı: ${e.message}") }
    }
    private val pdfLauncher = registerForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")) { uri ->
        if (uri != null) makePdf(uri)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        db = RsmDb(this)
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(18, 18, 18, 12); setBackgroundColor(0xFFF6F7F8.toInt()) }
        val brand = TextView(this).apply { text = "RSM-EMLAK"; textSize = 25f; setTextColor(0xFF183A4A.toInt()); paint.isFakeBoldText = true; gravity = Gravity.CENTER_VERTICAL; setPadding(4, 8, 4, 12) }
        root.addView(brand)
        val nav = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        listOf("Kişiler" to "people", "Taşınmazlar" to "properties", "Sözleşmeler" to "contracts").forEach { (label, value) ->
            nav.addView(Button(this).apply { text = label; isAllCaps = false; setOnClickListener { section = value; render() } }, LinearLayout.LayoutParams(0, -2, 1f))
        }
        root.addView(nav)
        header = TextView(this).apply { textSize = 19f; setTextColor(0xFF183A4A.toInt()); paint.isFakeBoldText = true; setPadding(4, 14, 4, 6) }
        root.addView(header)
        val actions = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        actions.addView(Button(this).apply { text = "+ Yeni kayıt"; isAllCaps = false; setOnClickListener { showAddDialog() } }, LinearLayout.LayoutParams(0, -2, 1f))
        actions.addView(Button(this).apply { text = "PDF taslağı"; isAllCaps = false; setOnClickListener { if (section == "contracts" && db.rows("contracts").isNotEmpty()) pdfLauncher.launch("RSM-EMLAK-sozlesme-taslagi.pdf") else toast("Önce Sözleşmeler bölümüne bir kayıt ekleyin.") } }, LinearLayout.LayoutParams(0, -2, 1f))
        root.addView(actions)
        val backupRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        backupRow.addView(Button(this).apply { text = "Yedekle"; isAllCaps = false; setOnClickListener { exportLauncher.launch("RSM-EMLAK-yedek.json") } }, LinearLayout.LayoutParams(0, -2, 1f))
        backupRow.addView(Button(this).apply { text = "Yedekten yükle"; isAllCaps = false; setOnClickListener { importLauncher.launch(arrayOf("application/json", "text/*", "application/octet-stream")) } }, LinearLayout.LayoutParams(0, -2, 1f))
        root.addView(backupRow)
        val scroll = ScrollView(this)
        content = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(0, 8, 0, 8) }
        scroll.addView(content)
        root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
        val note = TextView(this).apply { text = "Kayıtlar bu cihazda saklanır. Yedekleri güvenli bir yerde tutun."; textSize = 12f; setTextColor(0xFF606A70.toInt()); setPadding(4, 8, 4, 4) }
        root.addView(note)
        setContentView(root)
        render()
    }

    private fun render() {
        header.text = when (section) { "people" -> "Kişiler"; "properties" -> "Taşınmazlar"; else -> "Sözleşmeler" }
        content.removeAllViews()
        val rows = db.rows(section)
        if (rows.isEmpty()) {
            content.addView(TextView(this).apply { text = "Henüz kayıt yok. “+ Yeni kayıt” ile başlayın."; textSize = 16f; setPadding(12, 24, 12, 24); setTextColor(0xFF66727A.toInt()) })
            return
        }
        rows.forEach { row ->
            val title = when(section) { "people" -> row["name"].orEmpty(); "properties" -> row["title"].orEmpty(); else -> row["title"].orEmpty() }
            val details = when(section) {
                "people" -> listOf(row["phone"], row["identity"], row["address"]).filter { !it.isNullOrBlank() }.joinToString("\n")
                "properties" -> listOf(row["type"], row["address"], row["owner"]).filter { !it.isNullOrBlank() }.joinToString("\n")
                else -> listOf("Kiraya veren: ${row["landlord"]}", "Kiracı: ${row["tenant"]}", "Taşınmaz: ${row["property"]}", "Kira: ${row["rent"]}", "İmza: ${row["signing_date"]}", "Kira başlangıcı: ${row["rent_start"]}", "Kira bitişi: ${row["rent_end"]}").joinToString("\n")
            }
            val card = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(14, 12, 14, 12); setBackgroundColor(0xFFFFFFFF.toInt()) }
            card.addView(TextView(this).apply { text = title.ifBlank { "(Başlıksız kayıt)" }; textSize = 17f; setTextColor(0xFF183A4A.toInt()); paint.isFakeBoldText = true })
            if (details.isNotBlank()) card.addView(TextView(this).apply { text = details; textSize = 14f; setTextColor(0xFF3E484D.toInt()); setPadding(0, 6, 0, 0) })
            content.addView(card, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = 10 })
        }
    }

    private fun showAddDialog() {
        val fields = when(section) {
            "people" -> listOf("Ad soyad", "Telefon", "T.C. kimlik no (isteğe bağlı)", "Adres", "Not")
            "properties" -> listOf("Taşınmaz adı / kısa tanım", "Adres", "Tür (konut/işyeri)", "Malik / portföy sahibi", "Not")
            else -> listOf("Sözleşme başlığı", "Kiraya veren", "Kiracı", "Taşınmaz", "Aylık kira bedeli", "İmza / yürürlük tarihi (gg.aa.yyyy)", "Kira başlangıç tarihi (gg.aa.yyyy)", "Kira bitiş tarihi (gg.aa.yyyy)", "Not")
        }
        val wrap = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 8, 24, 0) }
        val inputs = fields.map { label ->
            val box = EditText(this).apply { hint = label; textSize = 15f; setSingleLine(false); maxLines = if (label.contains("Adres") || label == "Not") 3 else 1 }
            wrap.addView(box, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = 5 })
            box
        }
        val scroll = ScrollView(this).apply { addView(wrap) }
        AlertDialog.Builder(this).setTitle("Yeni kayıt").setView(scroll).setNegativeButton("Vazgeç", null).setPositiveButton("Kaydet") { _, _ ->
            if (inputs[0].text.toString().trim().isEmpty()) { toast("İlk alan boş bırakılamaz."); return@setPositiveButton }
            val keys = when(section) {
                "people" -> listOf("name","phone","identity","address","notes")
                "properties" -> listOf("title","address","type","owner","notes")
                else -> listOf("title","landlord","tenant","property","rent","signing_date","rent_start","rent_end","notes")
            }
            val cv = ContentValues()
            keys.forEachIndexed { i, key -> cv.put(key, inputs[i].text.toString().trim()) }
            db.insert(section, cv)
            render()
            toast("Kayıt bu cihaza kaydedildi.")
        }.show()
    }

    private fun makePdf(uri: Uri) {
        try {
            val item = db.rows("contracts").first()
            val pdf = PdfDocument()
            val page = pdf.startPage(PdfDocument.PageInfo.Builder(595, 842, 1).create())
            val paint = Paint().apply { textSize = 18f; color = android.graphics.Color.BLACK }
            val small = Paint().apply { textSize = 12f; color = android.graphics.Color.BLACK }
            var y = 60
            page.canvas.drawText("RSM-EMLAK — SÖZLEŞME TASLAĞI", 40f, y.toFloat(), paint); y += 35
            page.canvas.drawText("Bu belge taslaktır; imzadan önce taraflarca kontrol edilmelidir.", 40f, y.toFloat(), small); y += 40
            val lines = listOf(
                "Başlık: ${item["title"]}", "Kiraya veren: ${item["landlord"]}", "Kiracı: ${item["tenant"]}",
                "Taşınmaz: ${item["property"]}", "Aylık kira bedeli: ${item["rent"]}",
                "İmza / yürürlük tarihi: ${item["signing_date"]}", "Kira başlangıç tarihi: ${item["rent_start"]}",
                "Kira bitiş tarihi: ${item["rent_end"]}", "Not: ${item["notes"]}"
            )
            lines.forEach { line ->
                var rest = line
                while (rest.length > 75) { page.canvas.drawText(rest.take(75), 40f, y.toFloat(), small); rest = rest.drop(75); y += 20 }
                page.canvas.drawText(rest, 40f, y.toFloat(), small); y += 26
            }
            page.canvas.drawText("Not: Bu çıktı hukuki sözleşme şablonu değil, kayıt özeti taslağıdır.", 40f, 790f, small)
            pdf.finishPage(page)
            contentResolver.openOutputStream(uri)?.use { pdf.writeTo(it) }
            pdf.close()
            toast("PDF taslağı kaydedildi.")
        } catch (e: Exception) { toast("PDF oluşturulamadı: ${e.message}") }
    }
    private fun toast(message: String) = Toast.makeText(this, message, Toast.LENGTH_LONG).show()
}
