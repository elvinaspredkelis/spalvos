-- Spalvos Dark for Neovim / LazyVim.
--
-- There is no spalvos Neovim plugin, so this is a self-contained colorscheme:
-- highlight groups are set inline from the spalvos palette. Token -> colour
-- assignments mirror ../../zed/spalvos.json ("Spalvos Dark" syntax) so the
-- editor matches Zed and the terminal exactly. No external dependency.

local p = {
  bg       = "#1f1f1f", -- editor canvas (one step above the #171717 desktop)
  bg_dark  = "#171717", -- statusline / floats / sidebars
  bg_float = "#2c2b29", -- popups, elevated surfaces
  fg       = "#ecebe9",
  fg_dim   = "#b5b4b1",
  comment  = "#908f8c",
  gutter   = "#73716e",
  cursorln = "#2c2b29",
  visual   = "#003c3f", -- teal selection wash
  border   = "#343331",
  black    = "#343331",
  red      = "#eb5d6d",
  green    = "#5ec990",
  orange   = "#f99b56",
  blue     = "#5b7ef0",
  fn_blue  = "#82a1f7", -- lighter blue for function names
  magenta  = "#de54b3",
  cyan     = "#42cbd2",
  dim_cyan = "#0d959b",
  dim_red  = "#de1c4a",
  param    = "#f58991",
  string_special = "#fdb482",
  white    = "#d5d4d2",
}

local function apply()
  if vim.g.colors_name then vim.cmd("hi clear") end
  if vim.fn.exists("syntax_on") == 1 then vim.cmd("syntax reset") end
  vim.o.termguicolors = true
  vim.o.background = "dark"
  vim.g.colors_name = "spalvos-dark"

  local hl = vim.api.nvim_set_hl
  local groups = {
    -- Editor UI
    Normal       = { fg = p.fg, bg = p.bg },
    NormalNC     = { fg = p.fg, bg = p.bg },
    NormalFloat  = { fg = p.fg, bg = p.bg_float },
    FloatBorder  = { fg = p.border, bg = p.bg_float },
    FloatTitle   = { fg = p.cyan, bg = p.bg_float, bold = true },
    ColorColumn  = { bg = p.bg_dark },
    Cursor       = { fg = p.bg, bg = p.fg },
    CursorLine   = { bg = p.cursorln },
    CursorColumn = { bg = p.cursorln },
    CursorLineNr = { fg = p.fg, bold = true },
    LineNr       = { fg = p.gutter },
    SignColumn   = { bg = p.bg },
    Folded       = { fg = p.comment, bg = p.bg_float },
    FoldColumn   = { fg = p.gutter },
    VertSplit    = { fg = p.border },
    WinSeparator = { fg = p.border },
    Visual       = { bg = p.visual },
    Search       = { fg = p.bg, bg = p.cyan },
    IncSearch    = { fg = p.bg, bg = p.orange },
    CurSearch    = { fg = p.bg, bg = p.orange },
    MatchParen   = { fg = p.cyan, bold = true },
    Pmenu        = { fg = p.fg, bg = p.bg_float },
    PmenuSel     = { fg = p.fg, bg = p.visual },
    PmenuSbar    = { bg = p.bg_float },
    PmenuThumb   = { bg = p.border },
    StatusLine   = { fg = p.fg, bg = p.bg_dark },
    StatusLineNC = { fg = p.comment, bg = p.bg_dark },
    TabLine      = { fg = p.comment, bg = p.bg_dark },
    TabLineSel   = { fg = p.fg, bg = p.bg },
    TabLineFill  = { bg = p.bg_dark },
    WinBar       = { fg = p.fg, bg = p.bg },
    WinBarNC     = { fg = p.comment, bg = p.bg },
    Title        = { fg = p.fg, bold = true },
    Directory    = { fg = p.cyan },
    NonText      = { fg = p.border },
    Whitespace   = { fg = p.border },
    SpecialKey   = { fg = p.border },
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
    Number       = { fg = p.dim_cyan },
    Boolean      = { fg = p.green },
    Float        = { fg = p.dim_cyan },
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
    Macro        = { fg = p.cyan },
    Type         = { fg = p.orange },
    StorageClass = { fg = p.orange },
    Structure    = { fg = p.orange },
    Typedef      = { fg = p.orange },
    Special      = { fg = p.cyan },
    SpecialChar  = { fg = p.magenta },
    Delimiter    = { fg = p.comment },
    Tag          = { fg = p.dim_red },
    Todo         = { fg = p.bg, bg = p.orange, bold = true },
    Error        = { fg = p.red },
    Underlined   = { fg = p.cyan, underline = true },

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
    ["@function.builtin"]     = { fg = p.cyan },
    ["@function.macro"]       = { fg = p.cyan },
    ["@method"]               = { fg = p.fn_blue },
    ["@method.call"]          = { fg = p.fn_blue },
    ["@constructor"]          = { fg = p.dim_red },
    ["@parameter"]            = { fg = p.param },
    ["@variable"]             = { fg = p.white },
    ["@variable.builtin"]     = { fg = p.white },
    ["@variable.member"]      = { fg = p.cyan },
    ["@property"]             = { fg = p.cyan },
    ["@field"]                = { fg = p.cyan },
    ["@attribute"]            = { fg = p.cyan },
    ["@string"]               = { fg = p.green },
    ["@string.escape"]        = { fg = p.magenta },
    ["@string.regex"]         = { fg = p.dim_cyan },
    ["@string.special"]       = { fg = p.string_special },
    ["@character"]            = { fg = p.green },
    ["@number"]               = { fg = p.dim_cyan },
    ["@boolean"]              = { fg = p.green },
    ["@constant"]             = { fg = p.green },
    ["@constant.builtin"]     = { fg = p.green },
    ["@constant.macro"]       = { fg = p.cyan },
    ["@type"]                 = { fg = p.orange },
    ["@type.builtin"]         = { fg = p.orange },
    ["@type.definition"]      = { fg = p.orange },
    ["@namespace"]            = { fg = p.orange },
    ["@operator"]             = { fg = p.fg_dim },
    ["@punctuation"]          = { fg = p.comment },
    ["@punctuation.bracket"]  = { fg = p.comment },
    ["@punctuation.delimiter"]= { fg = p.comment },
    ["@punctuation.special"]  = { fg = p.magenta },
    ["@tag"]                  = { fg = p.dim_red },
    ["@tag.attribute"]        = { fg = p.cyan },
    ["@tag.delimiter"]        = { fg = p.comment },
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
    DiagnosticInfo  = { fg = p.cyan },
    DiagnosticHint  = { fg = p.comment },
    DiagnosticOk    = { fg = p.green },
    DiagnosticUnderlineError = { undercurl = true, sp = p.red },
    DiagnosticUnderlineWarn  = { undercurl = true, sp = p.orange },
    DiagnosticUnderlineInfo  = { undercurl = true, sp = p.cyan },
    DiagnosticUnderlineHint  = { undercurl = true, sp = p.comment },

    -- Git / diff
    DiffAdd     = { fg = p.green, bg = "#072f1c" },
    DiffChange  = { fg = p.orange, bg = "#3f1e04" },
    DiffDelete  = { fg = p.red, bg = "#420f16" },
    DiffText    = { fg = p.fg, bg = "#3f1e04" },
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
    TelescopeMatching      = { fg = p.cyan, bold = true },

    -- Which-key / misc plugins
    WhichKey       = { fg = p.cyan },
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
