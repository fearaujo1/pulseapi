package com.pulseapi.integration.domino.monitoring;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.HashSet;
import java.util.Set;

@Component
@ConfigurationProperties(prefix = "pulseapi.domino.monitoramento")
public class DominoMonitoringProperties {

    private boolean enabled = false;
    private int connectionTimeoutMs = 3000;
    private int inactivityTimeoutMs = 60000;
    private long initialReconnectDelayMs = 5000;
    private long maxReconnectDelayMs = 300000;
    private long reconciliationIntervalMs = 30000;
    private long startupJitterMaxMs = 10000;
    private Set<Long> equipamentoIds = new HashSet<>();
    private int maxHistoricalEvents = 16;
    private int maxMissedHeartbeats = 2;
    private boolean todosEquipamentosEnabled = false;


    private boolean ocorrenciasEnabled = false;



    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getConnectionTimeoutMs() {
        return connectionTimeoutMs;
    }

    public void setConnectionTimeoutMs(int connectionTimeoutMs) {
        this.connectionTimeoutMs = connectionTimeoutMs;
    }

    public int getInactivityTimeoutMs() {
        return inactivityTimeoutMs;
    }

    public void setInactivityTimeoutMs(int inactivityTimeoutMs) {
        this.inactivityTimeoutMs = inactivityTimeoutMs;
    }

    public long getInitialReconnectDelayMs() {
        return initialReconnectDelayMs;
    }

    public void setInitialReconnectDelayMs(long initialReconnectDelayMs) {
        this.initialReconnectDelayMs = initialReconnectDelayMs;
    }

    public long getMaxReconnectDelayMs() {
        return maxReconnectDelayMs;
    }

    public void setMaxReconnectDelayMs(long maxReconnectDelayMs) {
        this.maxReconnectDelayMs = maxReconnectDelayMs;
    }

    public long getReconciliationIntervalMs() {
        return reconciliationIntervalMs;
    }

    public void setReconciliationIntervalMs(long reconciliationIntervalMs) {
        this.reconciliationIntervalMs = reconciliationIntervalMs;
    }

    public long getStartupJitterMaxMs() {
        return startupJitterMaxMs;
    }

    public void setStartupJitterMaxMs(long startupJitterMaxMs) {
        this.startupJitterMaxMs = startupJitterMaxMs;
    }

    public Set<Long> getEquipamentoIds() {
        return equipamentoIds;
    }

    public void setEquipamentoIds(Set<Long> equipamentoIds) {
        this.equipamentoIds = equipamentoIds;
    }

    public boolean isOcorrenciasEnabled() {
        return ocorrenciasEnabled;
    }

    public void setOcorrenciasEnabled(boolean ocorrenciasEnabled) {
        this.ocorrenciasEnabled = ocorrenciasEnabled;
    }

    public int getMaxHistoricalEvents() {
        return maxHistoricalEvents;
    }

    public void setMaxHistoricalEvents(int maxHistoricalEvents) {
        this.maxHistoricalEvents = maxHistoricalEvents;
    }

    public int getMaxMissedHeartbeats() {
        return maxMissedHeartbeats;
    }

    public void setMaxMissedHeartbeats(int maxMissedHeartbeats) {
        this.maxMissedHeartbeats = maxMissedHeartbeats;
    }

    public boolean isTodosEquipamentosEnabled() {
        return todosEquipamentosEnabled;
    }

    public void setTodosEquipamentosEnabled(
            boolean todosEquipamentosEnabled
    ) {
        this.todosEquipamentosEnabled =
                todosEquipamentosEnabled;
    }
}