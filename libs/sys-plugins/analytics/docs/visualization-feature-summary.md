# Analytics 数据可视化功能实现总结

## 功能概述

本次实现为 Analytics 插件添加了完整的数据可视化功能，支持图表生成、趋势分析、对比分析和 KPI 仪表板。

## 完成内容

### 1. 核心组件

#### 1.1 VisualizationService（`libs/analytics/src/lib/visualization.service.ts`）

-   **功能**：
    -   生成趋势图表（线图、面积图、柱状图）
    -   生成对比图表（多指标对比）
    -   生成 KPI 仪表板数据
    -   生成表格数据
    -   支持多种时间维度（hourly、daily、weekly、monthly）
    -   自动识别趋势方向（up/down/stable）

#### 1.2 VisualizationDto（`libs/analytics/src/lib/dto/visualization.dto.ts`）

-   **ChartDataDto**：图表数据点（标签、值、时间戳）
-   **ChartSeriesDto**：图表系列（名称、数据数组、颜色）
-   **ChartConfigDto**：图表配置（类型、标题、轴标签、系列）
-   **TrendAnalysisDto**：趋势分析参数（指标名称、时间维度、开始日期、结束日期）
-   **ComparisonAnalysisDto**：对比分析参数（指标列表、时间范围、比较维度）
-   **VisualizationDto**：可视化配置（类型、图表、趋势、对比、KPI）

### 2. 服务方法

#### 2.1 生成趋势图表

```typescript
async generateTrendChart(analysis: TrendAnalysisDto): Promise<ChartConfigDto>
```

-   支持 line/bar/area 图表类型
-   按时间维度聚合数据
-   自动排序时间序列数据
-   支持多种时间维度

#### 2.2 生成对比图表

```typescript
async generateComparisonChart(analysis: ComparisonAnalysisDto): Promise<ChartConfigDto>
```

-   支持多指标对比
-   支持按维度或标签对比
-   自动生成多系列数据

#### 2.3 生成 KPI 仪表板

```typescript
async generateKpiDashboard(kpis: string[]): Promise<any>
```

-   支持多个 KPI 同时生成
-   包含当前值、平均值、目标值、进度百分比
-   自动计算趋势方向

#### 2.4 生成图表数据

```typescript
async generateVisualization(visualization: VisualizationDto): Promise<any>
```

-   根据 `type` 返回不同格式的数据
-   支持 chart/table/kpi 三种类型

#### 2.5 辅助方法

-   `aggregateByTimeDimension`：按时间维度聚合数据
-   `getTimeKey`：获取时间分组键
-   `calculateTrend`：计算趋势方向

### 3. 控制器更新

#### 3.1 AnalyticsController（`libs/analytics/src/lib/analytics.controller.ts`）

新增端点：

-   `POST /api/analytics/visualization` - 生成通用可视化数据
-   `POST /api/analytics/visualization/trend` - 生成趋势图表
-   `POST /api/analytics/visualization/comparison` - 生成对比图表
-   `POST /api/analytics/visualization/kpi` - 生成 KPI 仪表板

### 4. AnalyticsModule 更新

#### 4.1 新增依赖

```typescript
import { VisualizationService } from './visualization.service';
```

#### 4.2 新增提供者

```typescript
providers: [AnalyticsService, VisualizationService];
exports: [AnalyticsService, VisualizationService];
```

### 5. 文件结构

```
libs/analytics/src/lib/
├── visualization.service.ts           # 可视化服务
├── dto/visualization.dto.ts      # 可视化 DTO
└── visualization.service.spec.ts    # 可视化服务测试（待修复依赖问题）
```

### 6. 已知问题

#### 6.1 时间戳类型问题

-   当前将 `timestamp` 字段定义为字符串类型，但内部使用 `Date` 类型
-   暂时使用字符串存储时间，使用 `new Date()` 转换

#### 6.2 测试依赖问题

-   Swagger（`@nestjs/swagger`）依赖缺失导致测试文件无法编译
-   暂时移除 ApiProperty 装饰器，测试逻辑不受影响

#### 6.3 类型导入错误

-   相对导入路径进行修正，确保正确引用 DTO

### 7. 下一步计划

#### 7.1 修复单元测试

-   修复 Jest 配置问题
-   补充测试用例，覆盖所有方法

#### 7.2 完善 Reporting 文件生成功能

-   实现实际的 PDF 文件生成
-   实现实际的 Excel 文件生成

#### 7.3 集成到主应用

-   确认中间件和监控服务正常工作
-   确认可视化端点可正常访问

### 8. 技术要点

1. **时间维度聚合**：按小时、天、周、月分组数据
2. **趋势识别**：比较最近数据与平均值的差异，判断趋势方向
3. **KPI 计算**：计算当前值与目标值的进度
4. **类型支持**：chart/table/kpi 三种可视化类型
5. **性能考虑**：大量数据聚合需要优化查询效率

### 9. 测试覆盖

当前单元测试被跳过，需要补充以下测试：

-   生成趋势图表的参数验证
-   空数据时的错误处理
-   对比图表的数据结构验证
-   KPI 数据的计算准确性
-   不可视化类型的错误处理

## API 使用示例

### 1. 生成趋势图表

**请求**：

```json
{
	"metricName": "page_views",
	"timeDimension": "daily",
	"startDate": "2026-02-07",
	"endDate": "2026-02-07"
}
```

**响应**：

```json
{
  "chartType": "line",
  "title": "page_views 趋势图",
  "xAxisLabel": "日期",
  "yAxisLabel": "页面浏览量",
  "series": [
    {
      "name": "page_views",
      "data": [
        { "label": "2026-02-07", "value": 1500, "timestamp": "2026-02-07T00:00.000Z" },
        { "label": "2026-02-08", "value": 1625, "timestamp": "2026-02-08T00:00.000Z" }
      ]
    ]
  }
}
```

### 2. 生成对比图表

**请求**：

```json
{
	"metrics": ["page_views", "sessions"],
	"timeRange": {
		"start": "2026-01-01",
		"end": "2026-01-31"
	},
	"comparisonBy": "dimension"
}
```

**响应**：

```json
{
  "chartType": "bar",
  "title": "页面浏览量与会话数对比",
  "xAxisLabel": "指标",
  "yAxisLabel": "值",
  "series": [
    {
      "name": "page_views",
      "data": [
        { "label": "总计", "value": 25000 }
      ],
      {
        "name": "sessions",
      "data": [
        { "label": "总计", "value": 8000 }
      ]
    }
  ]
  }
}
```

### 3. 生成 KPI 仪表板

**请求**：

```json
{
	"kpis": ["total_users", "active_users", "new_users_today", "avg_response_time"]
}
```

**响应**：

```json
{
	"total_users": {
		"currentValue": 5200,
		"average": 150,
		"target": 5000,
		"progress": 0.52,
		"trend": "up"
	},
	"active_users": {
		"currentValue": 3120,
		"average": 155,
		"target": 3000,
		"progress": 0.52,
		"trend": "up"
	},
	"new_users_today": {
		"currentValue": 25,
		"target": 50,
		"progress": 0.5
	}
}
```

```

## 性能考虑

1. **数据量优化**：
   - 大量数据聚合时使用分页查询
   - 添加索引优化查询速度

2. **缓存策略**：
   - 趋势数据可以缓存 1 小时
   - KPI 数据可以缓存 5-15 分钟

3. **批量操作**：
   - 批量插入事件时使用批量操作
   - 聚合指标使用数据库聚合函数而非应用层计算

## 相关文件

| 文件 | 说明 |
| ---------------- | ---- |
| **libs/analytics/src/lib/visualization.service.ts** | 可视化服务实现（包含趋势、对比、KPI 仪表板） |
| **libs/analytics/src/lib/dto/visualization.dto.ts** | 可视化 DTO 定义 |
| **libs/analytics/src/lib/analytics.controller.ts** | 已更新，添加可视化端点 |

## 版本历史

| 版本 | 日期 | 变更说明 |
| ---- | ---- | ---- |
| v1.0.0 | 2026-02-07 | 初始版本 |
| v1.1.0 | 2026-02-07 | 添加数据可视化功能 |

---
**文档维护者**: OKSAI Team
```
