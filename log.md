# 操作日志

> 追加写入，记录所有 ingest、query 和 lint 操作。

## [2026-07-11] ingest | SciShow Kids 第一批 7 个视频
- 从 Clippings/ 迁移 7 个 clipping 到 Raw/videos/（按地质学/气象学/天文学分类）
- 创建 7 个实体页面（entities/）
  - every-kind-of-volcano-scishow-kids (L2, 8min, 地质)
  - mountains-and-volcanoes-compilation (L2+, 10min, 地质)
  - many-layers-of-sedimentary-rocks (L2, 8min, 地质)
  - whats-a-hurricane (L2, 4min, 气象)
  - what-is-a-tornado (L2, 3.5min, 气象)
  - what-causes-thunder-and-lightning (L1, 3min, 气象)
  - why-does-the-moon-change (L1-L2, 3.5min, 天文)
- 创建 10 个概念页面（concepts/）
  - 地质: volcano, magma-and-lava, plate-tectonics, fold-mountains, sedimentary-rock, erosion
  - 气象: hurricane, tornado, lightning-and-thunder
  - 天文: moon-phases
- 创建 4 个技能页面（skills/）
  - listening-comprehension, shadowing, retelling, childrens-interpreting
- 创建 3 个年龄分层页面（age-groups/）
  - ages-5-7 (L1), ages-8-10 (L2), ages-11-12 (L3)
- 创建 1 个对比页面（comparisons/）
  - geology-vs-weather-learning-paths
- 创建 1 个频道指南（entities/）
  - scishow-kids-channel-guide
- 更新 index.md 和 log.md

## [2026-07-11] init | 知识库结构初始化
- 创建了 Wiki 三层架构（Raw / Wiki / CLAUDE.md）
- 创建了目录：concepts/, entities/, skills/, age-groups/, comparisons/
- 生成了 index.md 和 log.md
- 生成了 CLAUDE.md Schema 文档
