<template>
  <div class="emoji-picker">
    <el-popover
      v-model:visible="visible"
      placement="top-start"
      :width="320"
      trigger="manual"
      popper-class="emoji-popover"
    >
      <template #reference>
        <button class="emoji-trigger" type="button" @click="togglePicker">
          <span class="emoji-icon">😊</span>
          <span class="emoji-text">表情</span>
        </button>
      </template>
      
      <div class="emoji-picker-content">
        <!-- 分类标签 -->
        <div class="emoji-tabs">
          <div
            v-for="category in categories"
            :key="category.key"
            class="emoji-tab"
            :class="{ active: activeCategory === category.key }"
            @click="activeCategory = category.key"
          >
            <span class="tab-icon">{{ category.icon }}</span>
          </div>
        </div>
        
        <!-- 表情列表 -->
        <div class="emoji-list">
          <div
            v-for="emoji in currentEmojis"
            :key="emoji"
            class="emoji-item"
            @click.stop="selectEmoji(emoji)"
            :title="emoji"
          >
            {{ emoji }}
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  select: [emoji: string]
}>()

const visible = ref(false)
const activeCategory = ref('recent')

// 表情分类
const categories = [
  { key: 'recent', icon: '🕒', name: '最近' },
  { key: 'smile', icon: '😊', name: '笑脸' },
  { key: 'gesture', icon: '👋', name: '手势' },
  { key: 'animal', icon: '🐶', name: '动物' },
  { key: 'food', icon: '🍕', name: '食物' },
  { key: 'activity', icon: '⚽', name: '活动' },
  { key: 'travel', icon: '✈️', name: '旅行' },
  { key: 'object', icon: '💡', name: '物品' },
  { key: 'symbol', icon: '❤️', name: '符号' }
]

// 表情数据
const emojiData: Record<string, string[]> = {
  smile: [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
    '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🫡',
    '🤐', '🤨', '😐', '😑', '😶', '🫥', '😶‍🌫️', '😏',
    '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪',
    '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
    '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳',
    '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁',
    '☹️', '😮', '😯', '😲', '😳', '🥺', '🥹', '😦',
    '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
    '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
    '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡',
    '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸',
    '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
  ],
  gesture: [
    '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳',
    '🫴', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟',
    '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
    '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏',
    '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅',
    '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻',
    '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️',
    '👅', '👄', '🫦', '💋', '🩸', '👶', '👧', '🧒',
    '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰',
    '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳',
    '👩‍🦲', '🧑‍🦲', '👨‍🦲', '🧔‍♀️', '🧔', '🧔‍♂️', '👵', '🧓',
    '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮',
    '👮‍♂️', '👷‍♀️', '👷', '👷‍♂️', '💂‍♀️', '💂', '💂‍♂️', '🕵️‍♀️'
  ],
  animal: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸',
    '🐵', '🙈', '🙉', '🙊', '🐒', '🦍', '🦧', '🐔',
    '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉',
    '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛',
    '🦋', '🐌', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️',
    '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙',
    '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬',
    '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍',
    '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒',
    '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏',
    '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺',
    '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜',
    '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫'
  ],
  food: [
    '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭',
    '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝',
    '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽',
    '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄',
    '🥜', '🫘', '🌰', '🍞', '🥐', '🥖', '🫓', '🥨',
    '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓',
    '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔',
    '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣',
    '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙',
    '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤',
    '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞',
    '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪',
    '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮',
    '🍯', '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾',
    '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🫗',
    '🥤', '🧋', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴'
  ],
  activity: [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
    '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
    '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
    '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌',
    '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺',
    '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣',
    '🧗', '🚵', '🚴', '🏎️', '🏍️', '🤹', '🎭', '🎨',
    '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷',
    '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯',
    '🎳', '🎮', '🎰', '🧩', '🪩', '🎪', '🎨', '🎭',
    '🖼️', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷'
  ],
  travel: [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
    '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼',
    '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍',
    '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞',
    '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊',
    '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🚁', '🛰️',
    '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️',
    '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥',
    '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡',
    '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋',
    '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡',
    '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤'
  ],
  object: [
    '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️',
    '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼',
    '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️',
    '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭',
    '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',
    '🪫', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️',
    '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳',
    '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️',
    '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️',
    '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️',
    '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿',
    '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺',
    '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️',
    '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁'
  ],
  symbol: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓',
    '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️',
    '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎',
    '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑',
    '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺',
    '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴',
    '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
    '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯',
    '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵',
    '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅',
    '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️',
    '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠',
    'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗',
    '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺',
    '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣',
    'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒',
    '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣',
    '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣',
    '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️',
    '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️',
    '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️',
    '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂',
    '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️',
    '🟰', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️',
    '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️',
    '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣',
    '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶',
    '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️',
    '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛',
    '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕',
    '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️',
    '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓'
  ]
}

// 最近使用的表情（从 localStorage 读取）
const recentEmojis = ref<string[]>([])

// 加载最近使用的表情
const loadRecentEmojis = () => {
  const stored = localStorage.getItem('recent_emojis')
  if (stored) {
    try {
      recentEmojis.value = JSON.parse(stored)
    } catch (e) {
      recentEmojis.value = []
    }
  }
}

// 保存最近使用的表情
const saveRecentEmoji = (emoji: string) => {
  // 移除已存在的
  const index = recentEmojis.value.indexOf(emoji)
  if (index > -1) {
    recentEmojis.value.splice(index, 1)
  }
  
  // 添加到开头
  recentEmojis.value.unshift(emoji)
  
  // 只保留最近 48 个
  if (recentEmojis.value.length > 48) {
    recentEmojis.value = recentEmojis.value.slice(0, 48)
  }
  
  // 保存到 localStorage
  localStorage.setItem('recent_emojis', JSON.stringify(recentEmojis.value))
}

// 当前分类的表情
const currentEmojis = computed(() => {
  if (activeCategory.value === 'recent') {
    return recentEmojis.value.length > 0 
      ? recentEmojis.value 
      : (emojiData.smile || []).slice(0, 24)
  }
  return emojiData[activeCategory.value] || []
})

// 选择表情
const selectEmoji = (emoji: string) => {
  emit('select', emoji)
  saveRecentEmoji(emoji)
  visible.value = false
}

// 切换显示
const togglePicker = () => {
  visible.value = !visible.value
}

// 初始化
loadRecentEmojis()
</script>

<style scoped lang="scss">
.emoji-picker {
  display: inline-block;
  
  .emoji-trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border: none;
    border-radius: 4px;
    background: none;
    cursor: pointer;
    transition: color 0.2s;
    font-size: 13px;
    color: var(--text-tertiary, #999);

    .emoji-icon {
      font-size: 17px;
      line-height: 1;
    }

    .emoji-text {
      font-weight: 500;
    }

    &:hover {
      color: #00aeec;
    }
  }
}

.emoji-picker-content {
  .emoji-tabs {
    display: flex;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid rgba(255, 154, 158, 0.15);
    margin-bottom: 8px;
    overflow-x: auto;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 154, 158, 0.3);
      border-radius: 2px;
    }
    
    .emoji-tab {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      
      .tab-icon {
        font-size: 20px;
        opacity: 0.6;
        transition: all 0.2s;
      }
      
      &:hover {
        background: rgba(255, 154, 158, 0.1);
        
        .tab-icon {
          opacity: 1;
          transform: scale(1.1);
        }
      }
      
      &.active {
        background: linear-gradient(135deg, rgba(255, 154, 158, 0.15) 0%, rgba(254, 207, 239, 0.15) 100%);
        
        .tab-icon {
          opacity: 1;
          transform: scale(1.15);
        }
      }
    }
  }
  
  .emoji-list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    max-height: 240px;
    overflow-y: auto;
    padding: 8px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 154, 158, 0.3);
      border-radius: 3px;
      
      &:hover {
        background: rgba(255, 154, 158, 0.5);
      }
    }
    
    .emoji-item {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
      
      &:hover {
        background: rgba(255, 154, 158, 0.1);
        transform: scale(1.2);
      }
      
      &:active {
        transform: scale(1.1);
      }
    }
  }
}

@media (max-width: 768px) {
  .emoji-picker-content {
    .emoji-tabs {
      padding: 6px;
      
      .emoji-tab {
        width: 28px;
        height: 28px;
        
        .tab-icon {
          font-size: 18px;
        }
      }
    }
    
    .emoji-list {
      grid-template-columns: repeat(6, 1fr);
      max-height: 200px;
      padding: 6px;
      
      .emoji-item {
        width: 28px;
        height: 28px;
        font-size: 20px;
      }
    }
  }
}
</style>

<style>
.emoji-popover {
  padding: 0 !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 24px rgba(255, 154, 158, 0.2) !important;
  border: 2px solid rgba(255, 154, 158, 0.15) !important;
}
</style>
