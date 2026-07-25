-- Spalvos Light for Neovim / LazyVim.
--
-- There is no spalvos Neovim plugin, so this is a self-contained colorscheme:
-- highlight groups are set inline from the spalvos palette. Token -> colour
-- assignments mirror ../../zed/spalvos.json ("Spalvos Light" syntax) so the
-- editor matches Zed and the terminal exactly. No external dependency.

local p = {
  bg       = "#fbfbfa",
  bg_dark  = "#f7f7f6", -- statusline / floats / sidebars
  bg_float = "#ffffff", -- popups, elevated surfaces
  fg       = "#343331",
  fg_dim   = "#565552",
  comment  = "#908f8c",
  gutter   = "#b5b4b1",
  cursorln = "#f7f7f6",
  visual   = "#cbf2f4", -- cyan selection wash
  border   = "#e7e7e6",
  red      = "#b41b3c",
  green    = "#13955e",
  orange   = "#954d0a",
  blue     = "#087075",
  fn_blue  = "#3858e8", -- function names
  magenta  = "#a70881",
  cyan     = "#0d959b",
  dim_red  = "#de1c4a",
  param    = "#8c182f",
  number   = "#087075",
  string_special = "#c4660d",
  white    = "#565552", -- variable ink
}

local function apply()
  if vim.g.colors_name then vim.cmd("hi clear") end
  if vim.fn.exists("syntax_on") == 1 then vim.cmd("syntax reset") end
  vim.o.termguicolors = true
  vim.o.background = "light"
  vim.g.colors_name = "spalvos-light"

  local hl = vim.api.nvim_set_hl
  local groups = {
    -- Editor UI
    Normal       = { fg = p.fg, bg = p.bg },
    NormalNC     = { fg = p.fg, bg = p.bg },
    NormalFloat  = { fg = p.fg, bg = p.bg_float },
    FloatBorder  = { fg = p.border, bg = p.bg_float },
    FloatTitle   = { fg = p.blue, bg = p.bg_float, bold = true },
    ColorColumn  = { bg = p.bg_dark },
    Cursor       = { fg = p.bg, bg = p.fg },
    CursorLine   = { bg = p.cursorln },
    CursorColumn = { bg = p.cursorln },
    CursorLineNr = { fg = p.fg, bold = true },
    LineNr       = { fg = p.gutter },
    SignColumn   = { bg = p.bg },
    Folded       = { fg = p.comment, bg = p.bg_dark },
    FoldColumn   = { fg = p.gutter },
    VertSplit    = { fg = p.border },
    WinSeparator = { fg = p.border },
    Visual       = { bg = p.visual },
    Search       = { fg = p.bg, bg = p.cyan },
    IncSearch    = { fg = p.bg, bg = p.orange },
    CurSearch    = { fg = p.bg, bg = p.orange },
    MatchParen   = { fg = p.blue, bold = true },
    Pmenu        = { fg = p.fg, bg = p.bg_dark },
    PmenuSel     = { fg = p.fg, bg = p.visual },
    PmenuSbar    = { bg = p.bg_dark },
    PmenuThumb   = { bg = p.border },
    StatusLine   = { fg = p.fg, bg = p.bg_dark },
    StatusLineNC = { fg = p.comment, bg = p.bg_dark },
    TabLine      = { fg = p.comment, bg = p.bg_dark },
    TabLineSel   = { fg = p.fg, bg = p.bg },
    TabLineFill  = { bg = p.bg_dark },
    WinBar       = { fg = p.fg, bg = p.bg },
    WinBarNC     = { fg = p.comment, bg = p.bg },
    Title        = { fg = p.fg, bold = true },
    Directory    = { fg = p.blue },
    NonText      = { fg = p.gutter },
    Whitespace   = { fg = p.border },
    SpecialKey   = { fg = p.gutter },
    Conceal      = { fg = p.comment },
    ErrorMsg     = { fg = p.red },
    WarningMsg   = { fg = p.orange },
    ModeMsg      = { fg = p.fg },
    MoreMsg      = { fg = p.green },
    Question     = { fg = p.green },

    -- Syntax (legacy groups; Treesitter links below refine)
    Comment      = { fg = p.comment, italic = true },
    Constant     = { fg = p.green },
    String       = { fg = p.green },
    Character    = { fg = p.green },
    Number       = { fg = p.number },
    Boolean      = { fg = p.green },
    Float        = { fg = p.number },
    Identifier   = { fg = p.white },
    Function     = { fg = p.fn_blue },
    Statement    = { fg = p.magenta },
    Keyword      = { fg = p.magenta },
    Conditional  = { fg = p.magenta },
    Repeat       = { fg = p.magenta },
    Label        = { fg = p.orange },
    Operator     = { fg = p.fg_dim },
    Exception    = { fg = p.magenta },
    PreProc      = { fg = p.magenta },
    Include      = { fg = p.magenta },
    Define       = { fg = p.magenta },
    Macro        = { fg = p.blue },
    Type         = { fg = p.orange },
    StorageClass = { fg = p.orange },
    Structure    = { fg = p.orange },
    Typedef      = { fg = p.orange },
    Special      = { fg = p.blue },
    SpecialChar  = { fg = p.magenta },
    Delimiter    = { fg = p.comment },
    Tag          = { fg = p.red },
    Todo         = { fg = p.bg, bg = p.orange, bold = true },
    Error        = { fg = p.red },
    Underlined   = { fg = p.blue, underline = true },

    -- Treesitter
    ["@comment"]              = { link = "Comment" },
    ["@keyword"]              = { fg = p.magenta },
    ["@keyword.function"]     = { fg = p.magenta },
    ["@keyword.return"]       = { fg = p.magenta },
    ["@keyword.operator"]     = { fg = p.magenta },
    ["@conditional"]          = { fg = p.magenta },
    ["@repeat"]               = { fg = p.magenta },
    ["@exception"]            = { fg = p.magenta },
    ["@function"]             = { fg = p.fn_blue },
    ["@function.call"]        = { fg = p.fn_blue },
    ["@function.builtin"]     = { fg = p.blue },
    ["@function.macro"]       = { fg = p.blue },
    ["@method"]               = { fg = p.fn_blue },
    ["@method.call"]          = { fg = p.fn_blue },
    ["@constructor"]          = { fg = p.red },
    ["@parameter"]            = { fg = p.param },
    ["@variable"]             = { fg = p.white },
    ["@variable.builtin"]     = { fg = p.white },
    ["@variable.member"]      = { fg = p.cyan },
    ["@property"]             = { fg = p.cyan },
    ["@field"]                = { fg = p.cyan },
    ["@attribute"]            = { fg = p.cyan },
    ["@string"]               = { fg = p.green },
    ["@string.escape"]        = { fg = p.magenta },
    ["@string.regex"]         = { fg = p.blue },
    ["@string.special"]       = { fg = p.string_special },
    ["@character"]            = { fg = p.green },
    ["@number"]               = { fg = p.number },
    ["@boolean"]              = { fg = p.green },
    ["@constant"]             = { fg = p.green },
    ["@constant.builtin"]     = { fg = p.green },
    ["@constant.macro"]       = { fg = p.blue },
    ["@type"]                 = { fg = p.orange },
    ["@type.builtin"]         = { fg = p.orange },
    ["@type.definition"]      = { fg = p.orange },
    ["@namespace"]            = { fg = p.orange },
    ["@operator"]             = { fg = p.fg_dim },
    ["@punctuation"]          = { fg = p.fg_dim },
    ["@punctuation.bracket"]  = { fg = p.fg_dim },
    ["@punctuation.delimiter"]= { fg = p.fg_dim },
    ["@punctuation.special"]  = { fg = p.magenta },
    ["@tag"]                  = { fg = p.red },
    ["@tag.attribute"]        = { fg = p.cyan },
    ["@tag.delimiter"]        = { fg = p.fg_dim },
    ["@label"]                = { fg = p.orange },
    ["@text.literal"]         = { fg = p.green },
    ["@text.title"]           = { fg = p.fg, bold = true },
    ["@text.uri"]             = { fg = p.cyan, underline = true },
    ["@text.emphasis"]        = { italic = true },
    ["@text.strong"]          = { bold = true },

    -- LSP semantic tokens
    ["@lsp.type.parameter"]   = { fg = p.param },
    ["@lsp.type.property"]    = { fg = p.cyan },
    ["@lsp.type.variable"]    = { fg = p.white },

    -- Diagnostics
    DiagnosticError = { fg = p.red },
    DiagnosticWarn  = { fg = p.orange },
    DiagnosticInfo  = { fg = p.blue },
    DiagnosticHint  = { fg = p.comment },
    DiagnosticOk    = { fg = p.green },
    DiagnosticUnderlineError = { undercurl = true, sp = p.red },
    DiagnosticUnderlineWarn  = { undercurl = true, sp = p.orange },
    DiagnosticUnderlineInfo  = { undercurl = true, sp = p.blue },
    DiagnosticUnderlineHint  = { undercurl = true, sp = p.comment },

    -- Git / diff
    DiffAdd     = { fg = p.green, bg = "#e5f7eb" },
    DiffChange  = { fg = p.orange, bg = "#ffeee4" },
    DiffDelete  = { fg = p.red, bg = "#feeded" },
    DiffText    = { fg = p.fg, bg = "#ffeee4" },
    diffAdded   = { fg = p.green },
    diffRemoved = { fg = p.red },
    diffChanged = { fg = p.orange },
    Added       = { fg = p.green },
    Removed     = { fg = p.red },
    Changed     = { fg = p.orange },
    GitSignsAdd    = { fg = p.green },
    GitSignsChange = { fg = p.orange },
    GitSignsDelete = { fg = p.red },

    -- Telescope
    TelescopeBorder        = { fg = p.border, bg = p.bg_dark },
    TelescopeNormal        = { fg = p.fg, bg = p.bg_dark },
    TelescopePromptNormal  = { fg = p.fg, bg = p.bg_float },
    TelescopePromptBorder  = { fg = p.border, bg = p.bg_float },
    TelescopeSelection     = { fg = p.fg, bg = p.visual },
    TelescopeMatching      = { fg = p.blue, bold = true },

    -- Which-key / misc plugins
    WhichKey       = { fg = p.blue },
    WhichKeyGroup  = { fg = p.magenta },
    WhichKeyDesc   = { fg = p.fg },
    NeoTreeNormal  = { fg = p.fg, bg = p.bg_dark },
    NeoTreeNormalNC= { fg = p.fg, bg = p.bg_dark },
  }

  for name, opts in pairs(groups) do
    hl(0, name, opts)
  end
end

return {
  {
    "LazyVim/LazyVim",
    opts = {
      colorscheme = apply,
    },
  },
}
