# Integration Examples - ChronoMark

This directory contains practical examples of how to integrate advanced features into the ChronoMark extension.

## 🤖 BookmarkFormWithAI.tsx

### Description
A complete example of how to integrate the AI-powered tag suggestion system into the existing bookmark form.

### Features
- ✅ **Automatic Suggestions**: Automatically generates tags based on the title and URL
- ✅ **Confidence System**: Shows the confidence level of each suggestion (0-100%)
- ✅ **Multiple Sources**: Domain, keywords, URL structure, and content analysis
- ✅ **Intuitive Interface**: Buttons to add individual suggestions or all at once
- ✅ **Compatibility**: Maintains all the functionalities of the original form

### How to Use

#### 1. Copy Necessary Files
```bash
# Copy the AI service
cp services/smartTaggingService.ts src/services/

# Copy the form example
cp examples/BookmarkFormWithAI.tsx src/components/
```

#### 2. Replace the Original Component
```typescript
// Instead of importing:
import { BookmarkForm } from './components/BookmarkForm';

// Import:
import { BookmarkFormWithAI } from './components/BookmarkFormWithAI';
```

#### 3. Use in Your Code
```typescript
<BookmarkFormWithAI
    onSave={handleSave}
    onCancel={handleCancel}
    onUpdate={handleUpdate}
    initialData={bookmarkData}
    allTags={existingTags}
/>
```

### AI Features

#### 🌐 Domain Analysis
- Automatically detects the site type (GitHub, YouTube, etc.)
- Suggests tags based on the known domain

#### 🔍 Keywords
- Extracts relevant keywords from the title
- Filters out common and irrelevant words

#### 📁 URL Structure
- Analyzes the URL structure to identify categories
- Detects patterns like `/docs/`, `/blog/`, `/api/`

#### 📝 Content Analysis
- Processes the title to identify technologies and topics
- Suggests tags based on the content's context

### User Interface

#### Suggestion Button
```
🤖 Suggest Tags with AI
```
- Appears when the title and URL are filled in
- Shows "⏳ Generating..." during processing

#### AI Suggestions
```
🤖 AI Suggestions:                    [Add All]
🌐 javascript     85%
🔍 tutorial       72%
📁 documentation  68%
```
- Each suggestion shows the source icon, tag, and confidence level
- Click individually to add a tag
- The "Add All" button accepts all suggestions

### Customization

#### Modify AI Rules
Edit the `services/smartTaggingService.ts` file:

```typescript
// Add new domains
const DOMAIN_MAPPINGS = {
    'mysite.com': ['my-tag', 'category'],
    // ...
};

// Add new keywords
const KEYWORD_MAPPINGS = {
    'my-word': ['related-tag'],
    // ...
};
```

#### Customize Interface
Modify the CSS styles at the end of the component:

```typescript
.ai-suggest-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    // Your custom styles
}
```

### Integration with External APIs

To use real AI APIs instead of the rule-based system:

```typescript
// Replace the generateAISuggestions function
const generateAISuggestions = async () => {
    try {
        // Call your AI API
        const response = await fetch('/api/suggest-tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, url })
        });
        
        const suggestions = await response.json();
        setAiSuggestions(suggestions);
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to the rule-based system
        const fallbackSuggestions = SmartTaggingService.suggestTags(title, url);
        setAiSuggestions(fallbackSuggestions);
    }
};
```

### Performance Considerations

- ✅ **Local Processing**: No network latency
- ✅ **Smart Caching**: Avoids unnecessary reprocessing
- ✅ **Lazy Loading**: Suggestions are generated only when needed
- ✅ **Robust Fallback**: The rule-based system is always available

### Next Steps

1. **Test the Example**: Copy and test the component
2. **Customize Rules**: Add specific domains and keywords
3. **Integrate External API**: If necessary, connect with AI services
4. **Improve Interface**: Customize the appearance according to your design

### Support

For questions about AI integration:
- 📖 See: `AI_INTEGRATION_GUIDE.md`
- 🛠️ Run: `make ai-setup`
- 📝 See this example: `examples/BookmarkFormWithAI.tsx`
