import { Header } from './Header'
import { Label } from './Label'
import { Paragraph } from './Paragraph'
import { Typography } from './Typography'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/TypographyNew',
  component: Typography,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label'],
      description: 'The HTML element to render',
    },
  },
} satisfies Meta<typeof Typography>

export default meta

type Story = StoryObj<typeof meta>

// Generic Typography Story
export const TypographyStory: Story = {
  args: {
    children: 'Pack my box with five dozen liquor jugs',
    as: 'span',
    variant: 'body',
    caps: false,
  },
}

export const HeaderVariations: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="space-y-8">
      <Header variant="h1">
        This is a long heading text to demonstrate the H1 size and how it wraps across multiple lines when the
        content is longer
      </Header>
      <Header variant="h1m">
        This is a long heading text to demonstrate the H1 Medium size and how it wraps across multiple lines
        when the content is longer
      </Header>
      <Header variant="h2">Heading Level 2</Header>
      <Header variant="h3">Heading Level 3</Header>
      <Header variant="h4">Heading Level 4</Header>
      <Header variant="h5">Heading Level 5</Header>
    </div>
  ),
}

export const HeaderVariationsWithCaps: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="space-y-8">
      <Header variant="h1" caps>
        This is a long heading text with caps to demonstrate the H1 size
      </Header>
      <Header variant="h1m" caps>
        This is a long heading text with caps to demonstrate the H1 Medium size
      </Header>
      <Header variant="h2" caps>
        Heading Level 2 With Caps
      </Header>
      <Header variant="h3" caps>
        Heading Level 3 With Caps
      </Header>
      <Header variant="h4" caps>
        Heading Level 4 With Caps
      </Header>
      <Header variant="h5" caps>
        Heading Level 5 With Caps
      </Header>
    </div>
  ),
}

export const ParagraphVariations: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="space-y-6">
      <Paragraph variant="body-l">
        This is a Body Large variant (body-l) with longer text to demonstrate how it handles content that
        flows across multiple lines. The quick brown fox jumps over the lazy dog.
      </Paragraph>
      <Paragraph variant="body-l" bold>
        This is a Body Large Bold variant that shows how bold text looks in longer paragraphs. Pack my box
        with five dozen liquor jugs.
      </Paragraph>
      <Paragraph variant="body">
        This is a Body variant that represents the default body text style. How vexingly quick daft zebras
        jump.
      </Paragraph>
      <Paragraph variant="body" bold>
        This is a Body Bold variant for emphasizing body text. The five boxing wizards jump quickly.
      </Paragraph>
      <Paragraph variant="body-s">
        This is a Body Small variant (body-s) for less prominent text content. Sphinx of black quartz, judge
        my vow.
      </Paragraph>
      <Paragraph variant="body-s" bold>
        This is a Body Small Bold variant for emphasized smaller text. Quick wafting zephyrs vex bold Jim.
      </Paragraph>
      <Paragraph variant="body-xs">
        This is a Body Extra Small variant (body-xs) for the smallest body text needs. The jay, pig, fox,
        zebra and my wolves quack.
      </Paragraph>
      <Paragraph variant="body-xs" bold>
        This is a Body Extra Small Bold variant for the smallest emphasized text. Watch Jeopardy!, Alex
        Trebek`s fun TV quiz game.
      </Paragraph>
    </div>
  ),
}

export const ParagraphVariationsWithCaps: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="space-y-6">
      <Paragraph variant="body-l" caps>
        This is a Body Large variant with caps demonstrating capitalized text
      </Paragraph>
      <Paragraph variant="body-l" bold caps>
        This is a Body Large Bold variant with caps
      </Paragraph>
      <Paragraph variant="body" caps>
        This is a Body variant with caps
      </Paragraph>
      <Paragraph variant="body" bold caps>
        This is a Body Bold variant with caps
      </Paragraph>
      <Paragraph variant="body-s" caps>
        This is a Body Small variant with caps
      </Paragraph>
      <Paragraph variant="body-s" bold caps>
        This is a Body Small Bold variant with caps
      </Paragraph>
      <Paragraph variant="body-xs" caps>
        This is a Body Extra Small variant with caps
      </Paragraph>
      <Paragraph variant="body-xs" bold caps>
        This is a Body Extra Small Bold variant with caps
      </Paragraph>
    </div>
  ),
}

export const LabelVariations: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label variant="tag">
          This is a Tag variant (t) with longer text to show the difference in size and how it handles longer
          content in a single line
        </Label>
        <br />
        <Label variant="tag-s">This is a Tag Small variant (ts)</Label>
        <br />
        <Label variant="tag-m">
          This is a Tag Medium variant (tm) with longer text to demonstrate the uppercase transformation and
          letter spacing
        </Label>
      </div>
    </div>
  ),
}

export const LabelVariationsWithCaps: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label variant="tag" caps>
          This is a Tag variant (t) with caps and longer text to show the difference
        </Label>
        <br />
        <Label variant="tag-s" caps>
          This is a Tag Small variant (ts) with caps
        </Label>
        <br />
        <Label variant="tag-m" caps>
          This is a Tag Medium variant (tm) with caps to show both uppercase and caps
        </Label>
      </div>
    </div>
  ),
}
