package com.satyagrah.el06.data.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey val id: String,
    val merchant: String,
    val itemsJson: String,
    val subtotal: Double,
    val tax: Double,
    val total: Double,
    val category: String,
    val createdAt: Long = System.currentTimeMillis(),
    val workflowRunId: String
)

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY createdAt DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)
}
