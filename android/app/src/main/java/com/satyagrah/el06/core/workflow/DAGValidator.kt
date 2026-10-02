package com.satyagrah.el06.core.workflow

data class ValidationResult(
    val isValid: Boolean,
    val errors: List<String>,
    val topologicalOrder: List<String>
)

object DAGValidator {

    fun validate(workflow: Workflow): ValidationResult {
        val errors = mutableListOf<String>()
        val nodeMap = workflow.nodes.associateBy { it.id }

        if (workflow.nodes.isEmpty()) {
            return ValidationResult(false, listOf("Workflow cannot be empty"), emptyList())
        }

        val adjacency = mutableMapOf<String, MutableList<String>>()
        val inDegree = mutableMapOf<String, Int>()

        for (node in workflow.nodes) {
            adjacency[node.id] = mutableListOf()
            inDegree[node.id] = 0
        }

        for (edge in workflow.edges) {
            if (!nodeMap.containsKey(edge.sourceNodeId) || !nodeMap.containsKey(edge.targetNodeId)) {
                errors.add("Edge references unknown node: ${edge.sourceNodeId} -> ${edge.targetNodeId}")
                continue
            }
            adjacency[edge.sourceNodeId]?.add(edge.targetNodeId)
            inDegree[edge.targetNodeId] = (inDegree[edge.targetNodeId] ?: 0) + 1
        }

        // Cycle Detection via DFS
        val visited = mutableSetOf<String>()
        val recursionStack = mutableSetOf<String>()

        fun hasCycleDfs(nodeId: String): Boolean {
            visited.add(nodeId)
            recursionStack.add(nodeId)

            for (neighbor in adjacency[nodeId] ?: emptyList()) {
                if (!visited.contains(neighbor)) {
                    if (hasCycleDfs(neighbor)) return true
                } else if (recursionStack.contains(neighbor)) {
                    return true
                }
            }

            recursionStack.remove(nodeId)
            return false
        }

        for (node in workflow.nodes) {
            if (!visited.contains(node.id)) {
                if (hasCycleDfs(node.id)) {
                    errors.add("Cyclic dependency detected in workflow DAG")
                    break
                }
            }
        }

        // Topological Sort (Kahn's Algorithm)
        val queue = ArrayDeque<String>()
        val topologicalOrder = mutableListOf<String>()
        val tempInDegree = inDegree.toMutableMap()

        for ((nodeId, deg) in tempInDegree) {
            if (deg == 0) queue.add(nodeId)
        }

        while (queue.isNotEmpty()) {
            val curr = queue.removeFirst()
            topologicalOrder.add(curr)

            for (neighbor in adjacency[curr] ?: emptyList()) {
                val updated = (tempInDegree[neighbor] ?: 1) - 1
                tempInDegree[neighbor] = updated
                if (updated == 0) queue.add(neighbor)
            }
        }

        if (topologicalOrder.size != workflow.nodes.size && errors.isEmpty()) {
            errors.add("Graph contains disconnected cyclic subgraphs")
        }

        return ValidationResult(
            isValid = errors.isEmpty(),
            errors = errors,
            topologicalOrder = if (errors.isEmpty()) topologicalOrder else emptyList()
        )
    }
}
