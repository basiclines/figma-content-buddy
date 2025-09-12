# Figma to Framer Plugin Conversion Specification

## Executive Summary

This document outlines the requirements, effort estimation, and implementation strategy for converting the existing "Content Buddy" Figma plugin to a Framer plugin while establishing a cross-platform architecture similar to React Native for design tool plugins.

## Current Plugin Analysis

### Plugin Overview
- **Name**: Content Buddy
- **Purpose**: AI-powered text content replacement and management tool
- **Core Features**:
  - Text layer detection and extraction
  - Content search and filtering
  - Simple text replacement
  - AI-powered content replacement using OpenAI API
  - Batch operations on multiple text layers
  - Local storage for user preferences

### Architecture Analysis

#### Current Figma Plugin Structure
```
src/
├── Core.js                 # Main plugin logic (Figma API interactions)
├── App.js                  # UI entry point
├── AppState.js             # Global state management
├── ui/
│   ├── views/
│   │   └── form/FormView.js    # Main UI form component
│   └── components/         # UI components (select, display, toolbar)
├── utils/
│   ├── Tracking.js         # Analytics tracking
│   ├── Router.js           # Navigation utilities
│   └── DisplayNetwork.js   # Network utilities
└── webpack.config.js       # Build configuration
```

#### Key Dependencies on Figma API
1. **Node Manipulation**: `figma.getNodeById()`, `figma.currentPage.selection`
2. **Text Operations**: Text node character access and font loading
3. **Storage**: `figma.clientStorage` for preferences
4. **UI Communication**: `figma.showUI()`, `figma.ui.postMessage()`
5. **Notifications**: `figma.notify()`

## Framer API Comparison

### Key Differences

| Feature | Figma API | Framer API | Conversion Complexity |
|---------|-----------|------------|----------------------|
| Global Object | `figma` | `framer` | Low |
| Node Selection | `figma.currentPage.selection` | `framer.getSelection()` | Medium |
| Text Access | Direct character access | Layer text properties | Medium |
| Storage | `figma.clientStorage` | `framer.storage` | Low |
| UI Integration | `figma.showUI()` | `framer.showUI()` | Low |
| Notifications | `figma.notify()` | `framer.notify()` | Low |
| Font Loading | `figma.loadFontAsync()` | Different approach needed | High |
| Canvas Manipulation | Direct node creation | Layer insertion methods | Medium |

### Framer-Specific Considerations
- Different layer hierarchy and text handling
- Canvas interaction patterns differ from Figma
- Plugin manifest structure variations
- Build and deployment process differences

## Proposed Cross-Platform Architecture

### 1. Platform Abstraction Layer (PAL)

Create a unified API that abstracts platform differences:

```javascript
// pal/index.js
export class DesignToolAPI {
  constructor(platform) {
    this.platform = platform;
    this.adapter = this.createAdapter(platform);
  }
  
  createAdapter(platform) {
    switch(platform) {
      case 'figma': return new FigmaAdapter();
      case 'framer': return new FramerAdapter();
      default: throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  
  // Unified methods
  getSelection() { return this.adapter.getSelection(); }
  getTextLayers() { return this.adapter.getTextLayers(); }
  updateTextContent(nodeId, content) { return this.adapter.updateTextContent(nodeId, content); }
  showNotification(message) { return this.adapter.showNotification(message); }
  // ... more unified methods
}
```

### 2. Platform-Specific Adapters

#### Figma Adapter
```javascript
// pal/adapters/FigmaAdapter.js
export class FigmaAdapter {
  getSelection() {
    return figma.currentPage.selection;
  }
  
  getTextLayers() {
    // Existing logic from Core.js
    return this.getTextNodesFrom(figma.currentPage.selection);
  }
  
  updateTextContent(nodeId, content) {
    const node = figma.getNodeById(nodeId);
    return figma.loadFontAsync(node.fontName).then(() => {
      node.characters = content;
    });
  }
  
  showNotification(message) {
    figma.notify(message);
  }
}
```

#### Framer Adapter
```javascript
// pal/adapters/FramerAdapter.js
export class FramerAdapter {
  getSelection() {
    return framer.getSelection();
  }
  
  getTextLayers() {
    // Framer-specific text layer extraction
    const selection = framer.getSelection();
    return this.extractTextFromSelection(selection);
  }
  
  updateTextContent(layerId, content) {
    // Framer-specific text update logic
    const layer = framer.getLayerById(layerId);
    layer.text = content;
  }
  
  showNotification(message) {
    framer.notify(message);
  }
}
```

### 3. Common Core Logic

Extract business logic into platform-agnostic modules:

```javascript
// core/ContentManager.js
export class ContentManager {
  constructor(designToolAPI) {
    this.api = designToolAPI;
  }
  
  async extractUniqueContent() {
    const textLayers = await this.api.getTextLayers();
    // Platform-agnostic content processing logic
    return this.processTextLayers(textLayers);
  }
  
  async replaceContent(replacements) {
    for (const replacement of replacements) {
      await this.api.updateTextContent(replacement.nodeId, replacement.newContent);
    }
  }
}
```

### 4. Unified UI Layer

Create a shared UI that works across platforms:

```javascript
// ui/UniversalUI.js
export class UniversalUI {
  constructor(designToolAPI) {
    this.api = designToolAPI;
    this.contentManager = new ContentManager(designToolAPI);
  }
  
  async initialize() {
    // Platform-agnostic UI initialization
    await this.renderInterface();
    this.bindEvents();
  }
  
  // Shared UI logic that works on both platforms
}
```

## Implementation Plan

### Phase 1: Foundation Setup (2-3 weeks)
1. **Platform Detection System**
   - Environment detection utilities
   - Platform-specific entry points
   - Build configuration for multiple targets

2. **Basic Adapter Implementation**
   - Core Figma adapter (refactor existing code)
   - Basic Framer adapter structure
   - Unified API interface definition

### Phase 2: Core Feature Porting (3-4 weeks)
1. **Text Layer Extraction**
   - Abstract text node traversal logic
   - Implement Framer-specific text layer detection
   - Handle different text layer types across platforms

2. **Content Management**
   - Port content processing logic
   - Implement unified content replacement
   - Handle font loading differences

3. **Storage Abstraction**
   - Abstract local storage operations
   - Implement Framer storage adapter
   - Migrate existing preferences

### Phase 3: UI Adaptation (2-3 weeks)
1. **UI Framework Abstraction**
   - Create platform-agnostic UI components
   - Handle different UI integration patterns
   - Maintain consistent styling

2. **Event Handling**
   - Abstract UI-to-core communication
   - Implement platform-specific event bridges
   - Ensure consistent user interactions

### Phase 4: Advanced Features (2-3 weeks)
1. **AI Integration**
   - Port OpenAI API integration
   - Ensure consistent error handling
   - Implement rate limiting and caching

2. **Analytics and Tracking**
   - Abstract tracking implementation
   - Ensure privacy compliance across platforms
   - Maintain consistent metrics

### Phase 5: Testing and Optimization (2 weeks)
1. **Cross-Platform Testing**
   - Unit tests for adapters
   - Integration tests for both platforms
   - Performance optimization

2. **Documentation and Deployment**
   - API documentation for the abstraction layer
   - Deployment guides for both platforms
   - Migration documentation

## Effort Estimation

### Development Time: 11-15 weeks total

| Phase | Figma Developer | Framer Developer | Shared |
|-------|----------------|------------------|--------|
| Phase 1 | 1 week | 1 week | 1 week |
| Phase 2 | 2 weeks | 3 weeks | 1 week |
| Phase 3 | 1 week | 2 weeks | 1 week |
| Phase 4 | 1 week | 1 week | 2 weeks |
| Phase 5 | 1 week | 1 week | 1 week |

### Resource Requirements
- **1 Senior Frontend Developer** with Figma plugin experience
- **1 Senior Frontend Developer** with Framer plugin experience  
- **1 Architect/Tech Lead** for cross-platform design
- **1 QA Engineer** for testing across platforms

### Risk Assessment

#### High Risk
- **Framer API Limitations**: Some Figma features may not have direct Framer equivalents
- **Performance Differences**: Different rendering and processing capabilities
- **Font Handling**: Complex font loading and text manipulation differences

#### Medium Risk
- **UI Framework Differences**: Different styling and component systems
- **Build Pipeline Complexity**: Managing dual-platform builds
- **Testing Complexity**: Ensuring consistent behavior across platforms

#### Low Risk
- **Basic API Translation**: Most core operations have equivalents
- **Storage and Preferences**: Similar capabilities across platforms
- **Network Operations**: Standard web APIs work on both platforms

## Technical Challenges

### 1. Text Manipulation Differences
**Challenge**: Figma provides direct character-level access while Framer may have different text handling.
**Solution**: Create text manipulation adapters that normalize operations across platforms.

### 2. Font Loading and Management
**Challenge**: Different font loading mechanisms and requirements.
**Solution**: Implement platform-specific font handling with fallback strategies.

### 3. Node Selection and Traversal
**Challenge**: Different selection models and node hierarchy structures.
**Solution**: Abstract selection operations and implement platform-specific traversal logic.

### 4. Build System Complexity
**Challenge**: Managing builds for multiple platforms with different requirements.
**Solution**: Implement modular webpack configuration with platform-specific entry points.

## Benefits of Cross-Platform Architecture

### For Development Teams
- **Reduced Maintenance**: Single codebase for core logic
- **Faster Feature Development**: Write once, deploy everywhere
- **Consistent User Experience**: Unified behavior across platforms
- **Better Testing**: Shared test suites and validation

### For Plugin Ecosystem
- **Lower Barrier to Entry**: Easier to target multiple platforms
- **Standardized Patterns**: Common architectural approaches
- **Community Benefits**: Shared utilities and best practices
- **Future-Proofing**: Easy to add support for new design tools

## Success Metrics

### Technical Metrics
- **Code Reuse**: Target 70%+ shared code between platforms
- **Performance**: No more than 10% performance degradation from native implementations
- **Bundle Size**: Keep platform-specific overhead under 20KB
- **API Coverage**: Support 90%+ of original plugin functionality

### User Experience Metrics
- **Feature Parity**: 100% feature compatibility across platforms
- **User Satisfaction**: Maintain current user ratings
- **Adoption Rate**: Track cross-platform user migration
- **Bug Reports**: Reduce platform-specific issues by 50%

## Future Considerations

### Extensibility
- Support for additional design tools (Sketch, Adobe XD)
- Plugin marketplace integration
- Community contribution guidelines

### Maintenance
- Automated testing across platforms
- Version synchronization strategies
- Breaking change management

### Scaling
- Multi-team development workflows
- Plugin template generation
- Documentation and training materials

## Conclusion

Converting the Content Buddy plugin to support both Figma and Framer while establishing a cross-platform architecture is a significant but achievable undertaking. The estimated 11-15 week timeline reflects the complexity of creating robust abstractions while maintaining feature parity across platforms.

The proposed architecture provides a solid foundation for future multi-platform plugin development, offering benefits similar to React Native's approach to mobile development. Success depends on careful attention to platform differences, thorough testing, and maintaining consistent user experiences across both design tools.

The investment in this cross-platform architecture will pay dividends for future plugin development and positions the team to quickly adapt to new design tools and platforms as they emerge.