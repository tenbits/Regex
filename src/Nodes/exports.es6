var Node = {};
(function(){

	var type_Group = 1,
		type_Literal = 2,
		type_OR = 3,
		type_Block = 4,
		type_Blocks = 5,
		type_Root = 0,
		type_Regex = 6;

	// import ./RegexOpts.es6
	// import ./AstNode.es6
	// import ./Literal.es6
	// import ./Or.es6
	// import ./Group.es6
	// import ./Block.es6
	// import ./Blocks.es6
	// import ./Root.es6
	// import ./RegexNode.es6



	Node = {
		Literal: Literal,
		Root: Root,
		Group: Group,
		Or: Or,
		Block: Block,
		Blocks: Blocks,
		RegexNode: RegexNode,
		REGEX: type_Regex,
		OR: type_OR,
		GROUP: type_Group,
		LITERAL: type_Literal,
		BLOCK: type_Block,
		BLOCKS: type_Blocks,
		ROOT: type_Root
	};
}());