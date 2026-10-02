package com.satyagrah.el06.core.cache

import java.security.MessageDigest

data class CacheEntry(
    val key: String,
    val workflowId: String,
    val nodeId: String,
    val outputData: String,
    val timestamp: Long = System.currentTimeMillis()
)

object IntermediateResultCache {
    private val cache = mutableMapOf<String, CacheEntry>()
    var hits = 0
        private set
    var misses = 0
        private set

    fun generateKey(workflowId: String, nodeId: String, input: String, modelVersion: String): String {
        val raw = "$workflowId::$nodeId::$input::$modelVersion"
        val bytes = MessageDigest.getInstance("SHA-256").digest(raw.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    fun get(key: String): CacheEntry? {
        val entry = cache[key]
        if (entry != null) {
            hits++
        } else {
            misses++
        }
        return entry
    }

    fun set(key: String, workflowId: String, nodeId: String, outputData: String) {
        cache[key] = CacheEntry(key, workflowId, nodeId, outputData)
    }

    fun clear() {
        cache.clear()
        hits = 0
        misses = 0
    }
}
