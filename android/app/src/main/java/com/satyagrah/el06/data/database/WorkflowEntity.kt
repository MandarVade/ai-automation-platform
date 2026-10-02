package com.satyagrah.el06.data.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "workflows")
data class WorkflowEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val domain: String,
    val jsonDefinition: String,
    val createdAt: Long,
    val updatedAt: Long
)

@Dao
interface WorkflowDao {
    @Query("SELECT * FROM workflows ORDER BY updatedAt DESC")
    fun getAllWorkflows(): Flow<List<WorkflowEntity>>

    @Query("SELECT * FROM workflows WHERE id = :id")
    suspend fun getWorkflowById(id: String): WorkflowEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkflow(workflow: WorkflowEntity)

    @Delete
    suspend fun deleteWorkflow(workflow: WorkflowEntity)
}

@Database(entities = [WorkflowEntity::class, ExpenseEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun workflowDao(): WorkflowDao
    abstract fun expenseDao(): ExpenseDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: android.content.Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "el06_automation_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
