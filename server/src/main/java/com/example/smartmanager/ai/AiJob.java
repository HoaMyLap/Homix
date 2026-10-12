package com.example.smartmanager.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiJob implements Serializable {
    private String taskId;
    private String title;
    private String description;
    private String projectId;
    private String userId;
}
