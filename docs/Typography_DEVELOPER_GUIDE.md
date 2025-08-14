# Typography Developer Guide

## 🚨 IMPORTANT: Extract Typography from Figma - But Only the Comment!

**We already have all typography variants implemented!** When you go to Figma, you only need to look at the comment (like `/* Body/B Bold */` or `/* Header/H3 */`) to know which variant to use. Don't extract individual properties like font-size, line-height, etc. - just use the comment to pick the right component variant.

## 📚 Available Typography Components

### 1. Header Component (`<Header>`)

Use for headings and titles. Automatically renders the correct HTML element (h1, h2, h3, etc.).

```tsx
import { Header } from '@/components/Typography/Header'

// Main page title
<Header variant="h1">PROPOSALS</Header>

// Section headers
<Header variant="h3">LATEST PROPOSALS</Header>

// Subsection headers
<Header variant="h4">Proposal Details</Header>
```

**Available variants:**

- `h1` - 28px (mobile) / 32px (desktop), KK-Topo font (default) - **Figma: Header/H1**
- `h2` - 24px, KK-Topo font - **Figma: Header/H2**
- `h3` - 20px, KK-Topo font - **Figma: Header/H3**
- `h4` - 16px, Rootstock Sans font - **Figma: Header/H4**
- `h5` - 12px, Rootstock Sans font - **Figma: Header/H5**
- `e1` - 52px (mobile) / 60px (desktop), KK-Topo font (emphasis) - **Figma: Emphase/E1**
- `e2` - 40px (mobile) / 44px (desktop), KK-Topo font (emphasis) - **Figma: Emphase/E2**
- `e3` - 32px (mobile) / 16px (desktop), KK-Topo font (emphasis) - **Figma: Emphase/E3**

### 2. Paragraph Component (`<Paragraph>`)

Use for body text and longer content blocks.

```tsx
import { Paragraph } from '@/components/Typography/Paragraph'

// Regular body text
<Paragraph variant="body">This is regular body text for paragraphs.</Paragraph>

// Large body text
<Paragraph variant="body-l">This is larger body text for emphasis.</Paragraph>

// Small body text
<Paragraph variant="body-s">This is smaller body text for captions.</Paragraph>

// Bold body text variants
<Paragraph variant="body" bold>This is bold body text.</Paragraph>
<Paragraph variant="body-l" bold>This is bold large body text.</Paragraph>
<Paragraph variant="body-s" bold>This is bold small body text.</Paragraph>
<Paragraph variant="body-xs" bold>This is bold extra small body text.</Paragraph>
```

**Available variants:**

- `body-l` - 18px, Rootstock Sans font - **Figma: Body/BL Regular**
- `body` - 16px, Rootstock Sans font (default) - **Figma: Body/B Regular**
- `body-s` - 14px, Rootstock Sans font - **Figma: Body/BS Regular**
- `body-xs` - 12px, Rootstock Sans font - **Figma: Body/BXS Regular**

**Note:** All body variants support the `bold` prop:

- `body-l` + `bold` - **Figma: Body/BL Bold**
- `body` + `bold` - **Figma: Body/B Bold**
- `body-s` + `bold` - **Figma: Body/BS Bold**
- `body-xs` + `bold` - **Figma: Body/BXS Bold**

### 3. Span Component (`<Span>`)

Use for inline text elements. **Note: This component also supports emphasis variants.**

```tsx
import { Span } from '@/components/Typography/Span'

// Inline text with custom styling
<Span variant="body-s">Small inline text</Span>

// Tag-like text
<Span variant="tag">Tag Text</Span>

// Emphasis variants (same as Header)
<Span variant="e1">Large emphasis text</Span>
<Span variant="e2">Medium emphasis text</Span>
<Span variant="e3">Small emphasis text</Span>

// Bold inline text variants
<Span variant="body" bold>Bold inline text</Span>
<Span variant="body-l" bold>Bold large inline text</Span>
<Span variant="body-s" bold>Bold small inline text</Span>
<Span variant="tag" bold>Bold tag text</Span>
```

**Available variants:** Same as Paragraph + tag variants + emphasis variants

**Tag variants:**

- `tag` - 16px, Rootstock Sans font - **Figma: Tags/T Regular**
- `tag-s` - 14px, Rootstock Sans font - **Figma: Tags/TS**

**Emphasis variants:**

- `e1` - 52px (mobile) / 60px (desktop), KK-Topo font - **Figma: Emphase/E1**
- `e2` - 40px (mobile) / 44px (desktop), KK-Topo font - **Figma: Emphase/E2**
- `e3` - 32px (mobile) / 16px (desktop), KK-Topo font - **Figma: Emphase/E3**

**Note:** All tag and emphasis variants support the `bold` prop.

### 4. Label Component (`<Label>`)

Use for form labels and small text elements.

```tsx
import { Label } from '@/components/Typography/Label'

// Form label
<Label variant="tag">Username</Label>

// Small label
<Label variant="body-s">Status</Label>
```

**Available variants:**

- `tag` - 16px - **Figma: Tags/T Regular**
- `tag-s` - 14px - **Figma: Tags/TS**
- `body-l` - 18px - **Figma: Body/BL Regular**
- `body` - 16px - **Figma: Body/B Regular**
- `body-s` - 14px - **Figma: Body/BS Regular**
- `body-xs` - 12px - **Figma: Body/BXS Regular**

**Note:** All variants support the `bold` prop.

## 🎨 Customization Options

All typography components support these modifiers:

**Important:** All variants support these props:

- `bold` - Makes the text bold (uses `font-medium` for `body-s`/`body-xs`, `font-bold` for others)
- `caps` - Transforms text to uppercase
- `html` - Allows rendering sanitized HTML content

### Bold Text

```tsx
// Make any variant bold
<Header variant="h3" bold>Bold Heading</Header>
<Paragraph variant="body" bold>Bold paragraph text</Paragraph>

// Note: body-s and body-xs use font-medium, others use font-bold
<Span variant="body-s" bold>Medium weight small text</Span>
<Span variant="body" bold>Bold weight regular text</Span>
```

### Uppercase Text

```tsx
// Transform text to uppercase
<Header variant="h1" caps>PROPOSALS</Header>
<Span variant="tag" caps>STATUS</Span>

// Special tracking for tag variants when using caps
<Span variant="tag" caps>Special spacing for tags</Span>
```

### Custom Colors

```tsx
// Apply custom colors using className
<Header variant="h3" className="text-white">White Heading</Header>
<Paragraph variant="body-s" className="text-[#DEFF1A]">Lime text</Paragraph>
```

### HTML Content

```tsx
// Render HTML content (sanitized)
<Paragraph variant="body" html>This text contains <strong>bold</strong> and <em>italic</em> HTML.</Paragraph>
<Span variant="body-s" html>Inline text with <a href="#">links</a> and <code>code</code>.</Span>
```

### Combining Props

```tsx
// You can combine multiple props
<Header variant="h3" bold caps>BOLD UPPERCASE HEADING</Header>
<Paragraph variant="body-l" bold html>Bold text with <strong>HTML</strong> content.</Paragraph>
<Span variant="tag" caps bold>BOLD UPPERCASE TAG</Span>
```

## 📱 Real-World Examples

### Example 1: Page Header (H1)

**Instead of extracting from Figma:**

```tsx
// ❌ DON'T DO THIS - Don't extract properties from Figma
<div className="font-kk-topo text-[32px] font-normal leading-[30px] text-white uppercase">
  PROPOSALS
</div>

// ❌ DON'T DO THIS - Don't use BaseTypography directly
<BaseTypography variant="h1" caps className="text-white">PROPOSALS</BaseTypography>

// ✅ DO THIS - Use the Header component
<Header variant="h1" caps className="text-white">PROPOSALS</Header>
```

### Example 2: Section Header (H3)

**Instead of extracting from Figma:**

```tsx
// ❌ DON'T DO THIS - Don't extract properties from Figma
<div className="font-kk-topo text-[20px] font-normal leading-[23.4px] tracking-[0.02em] text-white uppercase">
  LATEST PROPOSALS
</div>

// ❌ DON'T DO THIS - Don't use BaseTypography directly
<BaseTypography variant="h3" caps className="text-white">LATEST PROPOSALS</BaseTypography>

// ✅ DO THIS - Use the Header component
<Header variant="h3" caps className="text-white">LATEST PROPOSALS</Header>
```

### Example 3: Body Text (Body-S)

**Instead of extracting from Figma:**

```tsx
// ❌ DON'T DO THIS - Don't extract properties from Figma
<span className="font-rootstock-sans text-[14px] font-normal leading-[20.3px] text-[#DEFF1A]">
  47h 59min
</span>

// ❌ DON'T DO THIS - Don't use BaseTypography directly
<BaseTypography variant="body-s" className="text-[#DEFF1A]">47h 59min</BaseTypography>

// ✅ DO THIS - Use the Span component
<Span variant="body-s" className="text-[#DEFF1A]">47h 59min</Span>
```

### Example 4: Sidebar Text (Body-S)

**Instead of extracting from Figma:**

```tsx
// ❌ DON'T DO THIS - Don't extract properties from Figma
<div className="font-rootstock-sans text-[14px] font-normal leading-[20.3px] text-white">
  Proposals
</div>

// ❌ DON'T DO THIS - Don't use BaseTypography directly
<BaseTypography variant="body-s" className="text-white">Proposals</BaseTypography>

// ✅ DO THIS - Use the Label component
<Label variant="body-s" className="text-white">Proposals</Label>
```

### Example 5: Large Body Text (Body-L)

**Instead of extracting from Figma:**

```tsx
// ❌ DON'T DO THIS - Don't extract properties from Figma
<div className="font-rootstock-sans text-[20px] font-normal leading-[23.94px] text-white">
  123,456,789
</div>

// ❌ DON'T DO THIS - Don't use BaseTypography directly
<BaseTypography variant="body-l" className="text-white">123,456,789</BaseTypography>

// ✅ DO THIS - Use the Span component
<Span variant="body-l" className="text-white">123,456,789</Span>
```

### Example 6: Button Text (Body Bold)

**Instead of extracting from Figma:**

```tsx
// ❌ DON'T DO THIS - Don't extract properties from Figma
<span className="font-rootstock-sans text-[16px] font-bold leading-[24px] text-[#171412]">
  Vote proposal
</span>

// ❌ DON'T DO THIS - Don't use BaseTypography directly
<BaseTypography variant="body" bold className="text-[#171412]">Vote proposal</BaseTypography>

// ✅ DO THIS - Use the Label component with bold prop
<Label variant="body" bold className="text-[#171412]">Vote proposal</Label>
```

### Example 7: Emphasis Text (E1)

**Instead of extracting from Figma:**

```tsx
// ❌ DON'T DO THIS - Don't extract properties from Figma
<div className="font-kk-topo text-[60px] font-normal leading-[108%] uppercase text-white">
  HERO TITLE
</div>

// ❌ DON'T DO THIS - Don't use BaseTypography directly
<BaseTypography variant="e1" className="text-white">HERO TITLE</BaseTypography>

// ✅ DO THIS - Use the Header component
<Header variant="e1" className="text-white">HERO TITLE</Header>

// Or use the Span component for inline emphasis
<Span variant="e1" className="text-white">HERO TITLE</Span>
```

## 🔍 How to Find the Right Variant

### **Step-by-Step Figma Process:**

1. **Enable Dev Mode** in Figma (it's the last button at the bottom of the toolbar - looks like `</>`)
2. **Select the text element** you want to inspect
3. **Look at the right sidebar** for the "Typography" section
4. **Find the comment** like `/* Header/H3 */`, `/* Body/B Regular */`, `/* Body/BS Regular */`
5. **Use the comment to pick the right variant** - The comment tells you exactly which component and variant to use

### **Important Notes:**

- **Don't extract other properties** - Font-size, line-height, etc. are already implemented in our components
- **Only the comment matters** - That's your key to finding the right variant
- **Use the Typography Stories** - Run `npm run storybook` and check the Typography section for examples
- **Check the Notion page** - Reference the [DAO TOK Way of Working](https://www.notion.so/rootstock/DAO-TOK-Way-of-Working-Ver-2-1cac132873f980f89871c436df29ac85?source=copy_link#211c132873f980e78e37c1aab07ca96a)

### **What You'll See in Figma:**

When you select a text element in Dev Mode, the right sidebar will show:

- **Typography section** with the variant comment (e.g., `/* Header/H3 */`)
- **CSS properties** (font-size, line-height, etc.) - **IGNORE THESE**
- **Color information** - **USE THIS** if you need custom colors

**Remember:** Only copy the comment from the Typography section, not the individual CSS properties!

## 📋 Variant Mapping Reference

| Figma Comment            | Component                 | Variant            | Font Size (Mobile/Desktop) | Font Family    |
| ------------------------ | ------------------------- | ------------------ | -------------------------- | -------------- |
| `/* Header/H1 */`        | `<Header>` or `<Span>`    | `h1`               | 28px / 32px                | KK-Topo        |
| `/* Header/H2 */`        | `<Header>` or `<Span>`    | `h2`               | 24px                       | KK-Topo        |
| `/* Header/H3 */`        | `<Header>` or `<Span>`    | `h3`               | 20px                       | KK-Topo        |
| `/* Header/H4 */`        | `<Header>` or `<Span>`    | `h4`               | 16px                       | Rootstock Sans |
| `/* Header/H5 */`        | `<Header>` or `<Span>`    | `h5`               | 12px                       | Rootstock Sans |
| `/* Emphase/E1 */`       | `<Header>` or `<Span>`    | `e1`               | 52px / 60px                | KK-Topo        |
| `/* Emphase/E2 */`       | `<Header>` or `<Span>`    | `e2`               | 40px / 44px                | KK-Topo        |
| `/* Emphase/E3 */`       | `<Header>` or `<Span>`    | `e3`               | 32px / 16px                | KK-Topo        |
| `/* Body/B Regular */`   | `<Paragraph>` or `<Span>` | `body`             | 16px                       | Rootstock Sans |
| `/* Body/B Bold */`      | `<Paragraph>` or `<Span>` | `body` + `bold`    | 16px                       | Rootstock Sans |
| `/* Body/BL Regular */`  | `<Paragraph>` or `<Span>` | `body-l`           | 18px                       | Rootstock Sans |
| `/* Body/BL Bold */`     | `<Paragraph>` or `<Span>` | `body-l` + `bold`  | 18px                       | Rootstock Sans |
| `/* Body/BS Regular */`  | `<Paragraph>` or `<Span>` | `body-s`           | 14px                       | Rootstock Sans |
| `/* Body/BS Bold */`     | `<Paragraph>` or `<Span>` | `body-s` + `bold`  | 14px                       | Rootstock Sans |
| `/* Body/BXS Regular */` | `<Paragraph>` or `<Span>` | `body-xs`          | 12px                       | Rootstock Sans |
| `/* Body/BXS Bold */`    | `<Paragraph>` or `<Span>` | `body-xs` + `bold` | 12px                       | Rootstock Sans |
| `/* Tags/T Regular */`   | `<Label>` or `<Span>`     | `tag`              | 16px                       | Rootstock Sans |
| `/* Tags/TS */`          | `<Label>` or `<Span>`     | `tag-s`            | 14px                       | Rootstock Sans |

## 🚫 What NOT to do

- ❌ Don't extract individual font properties (font-size, line-height, letter-spacing, etc.) from Figma
- ❌ Don't create custom CSS classes for typography
- ❌ Don't use inline styles for typography
- ❌ Don't use the `BaseTypography` component directly
- ❌ Don't ignore the Figma comment - that's the key to finding the right variant!

## ✅ What to do

- ✅ Go to Figma and find the typography comment (like `/* Header/H3 */` or `/* Body/B Bold */`)
- ✅ Use the comment to pick the right component and variant
- ✅ Use the appropriate typography component (`<Header>`, `<Paragraph>`, `<Span>`, `<Label>`)
- ✅ Apply the correct variant based on the Figma comment
- ✅ Use the `bold` prop for bold text (note: body-s/body-xs use font-medium, others use font-bold)
- ✅ Use the `caps` prop for uppercase text
- ✅ Apply custom colors using `className`
- ✅ Check the typography stories for examples
- ✅ Reference the Notion page for guidance

## 🆘 Need Help?

1. **Check the Typography Stories** - Run `npm run storybook` and navigate to Components > Typography
2. **Check the Notion page** - [DAO TOK Way of Working](https://www.notion.so/rootstock/DAO-TOK-Way-of-Working-Ver-2-1cac132873f980f89871c436df29ac85?source=copy_link#211c132873f980e78e37c1aab07ca96a)
3. **Check the Figma design system** - [Collective Redesign - Styles](https://www.figma.com/design/YTe0FjjzvJFFw765SFJyss/Collective-Redesign---Styles?node-id=6-108&p=f&t=c8a3nn8mlBBMBd3M-0)
4. **Ask the team** - Don't recreate what already exists!

---

**Remember: Go to Figma to find the typography comment, then use our pre-built components with the right variant. We've already implemented all the font properties - you just need to pick the right one! 🎯**
