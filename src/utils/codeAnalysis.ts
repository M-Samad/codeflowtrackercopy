//codeAnalysis.ts
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { fetchRepoFiles, isValidFile } from './utils';
import { Occurrence, FunctionUsage } from './types';

type PluginName = "jsx" | "typescript";

const AST_PARSE_CONFIG: {
  sourceType: "module" | "script" | "unambiguous";
  plugins: PluginName[];
} = {
  sourceType: "module",
  plugins: ["jsx", "typescript"]
};


export async function analyzeFile(filePath: string, searchString: string): Promise<Occurrence[]> {
    const fileContentOrItems = await fetchRepoFiles(filePath);

    if (typeof fileContentOrItems !== 'string') {
        console.error(`Expected file content but received a list of items for path: ${filePath}`);
        return [];
    }

    const ast = parse(fileContentOrItems, AST_PARSE_CONFIG);
    let occurrences: Occurrence[] = [];

    traverse(ast, {
        Identifier(path) {
            if (path.node.name === searchString) {
                
                let functionName = "Global/Outside Function";
                let parentFunction = path.findParent((p) => p.isFunctionDeclaration() || p.isArrowFunctionExpression() || p.isFunctionExpression());
                
                if (parentFunction && parentFunction.node.type === 'FunctionDeclaration' && parentFunction.node.id) {
                    functionName = parentFunction.node.id.name;
                }

                let codeBlock = "";
                let enclosingStatement = path.findParent((p) => p.isStatement());  
                if (enclosingStatement) {
                    const startLine = enclosingStatement.node.loc?.start.line ?? 0;
                    const endLine = enclosingStatement.node.loc?.end.line ?? 0;
                    if (startLine && endLine) {
                        codeBlock = fileContentOrItems.split('\n').slice(startLine - 1, endLine).join('\n');
                    }
                }

                let declaration = path.findParent((p) => p.isFunctionDeclaration() || p.isImportDeclaration() || p.isVariableDeclaration());
                let context = '';
                if (path.parentPath.isJSXAttribute()) {
                    context = "JSX Attribute";
                }
                // Hook Declaration
                else if (path.parentPath.isCallExpression() && ["useState", "useEffect", "useMemo", "useCallback", "useRef", "useContext"].includes(path.parentPath.node.callee.name)) {
                    context = "Hook Declaration";
                }
                // JSX Element
                else if (path.parentPath.isJSXOpeningElement()) {
                    context = "JSX Element";
                }
                // Import Statement
                else if (path.parentPath.isImportSpecifier() || path.parentPath.isImportDefaultSpecifier()) {
                    context = "Import Statement";
                }
                // Function Parameter
               else if (path.parentPath.isFunctionDeclaration() || path.parentPath.isFunctionExpression() || path.parentPath.isArrowFunctionExpression()) {
                    const functionNode = path.parentPath.node;

                    // Check if the identifier matches a function parameter
                    if (functionNode.params.some(param => param.type === "Identifier" && param.name === searchString)) {
                        context = "Function Parameter";
                    }
                    // Check if the identifier is the name of the function being declared, but only for FunctionDeclaration
                    else if (path.parentPath.isFunctionDeclaration() && functionNode.id && functionNode.id.type === "Identifier" && functionNode.id.name === searchString) {
                        context = "Function Declaration";
                    }
                }
                // Return Statement (deep check)
                else if (path.findParent((p) => p.isReturnStatement())) {
                    context = 'Return Statement';
                }
                // Function Call
                else if (path.parentPath.isCallExpression()) {
                    context = 'Function Call';
                }
                // Variable Declaration
                else if (path.parentPath.isVariableDeclarator()) {
                    context = 'Variable Declaration';
                } 
                // Object Property
                else if (path.parentPath.isObjectProperty()) {
                    context = 'Object Property';
                } 
                // Array Element
                else if (path.parentPath.isArrayExpression()) {
                    context = 'Array Element';
                }
                else if (
                    path.parentPath.isBinaryExpression() &&
                    ["===", "!==", "==", "!=", "<", ">", "<=", ">="].includes(
                      path.parentPath.node.operator
                    ) &&
                    (path.parentPath.parentPath.isConditionalExpression() ||
                      path.parentPath.parentPath.isIfStatement())
                  ) {
                    context = "Equality or Comparison Check";
                  }


                if (declaration) {
                    const startLine = declaration.node.loc?.start.line ?? 0;
                    const endLine = declaration.node.loc?.end.line ?? 0;
                    let declarationCode = fileContentOrItems.split('\n').slice(startLine - 1, endLine).join('\n');
                    occurrences.push({
                        type: path.type,
                        location: path.node.loc ?? { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }, // Default value if loc is null or undefined
                        file: filePath,
                        function: functionName,
                        codeBlock: codeBlock,
                        declaration: declarationCode,
                        context: context
                    });      
                }
            }
        }
    });
    return occurrences;
}

export async function analyzeFunctionUsage(functionName: string): Promise<FunctionUsage[]> {
  const repoContent = await fetchRepoFiles();
  let functionUsages: FunctionUsage[] = [];
    if (typeof repoContent === 'string') {
        console.error("Expected a list of RepoItems but received a string.");
        return [];
    }
    for (let item of repoContent) {
        if (item.type === "file" && isValidFile(item.name)) {
            const fileContent = await fetchRepoFiles(item.path);
            if (typeof fileContent !== 'string') {
                console.error(`Expected file content but received a list of items for path: ${item.path}`);
                return [];
            }
            const ast = parse(fileContent, AST_PARSE_CONFIG);
            traverse(ast, {
                CallExpression(path) {
                    if (path.node.callee.type === "Identifier" && path.node.callee.name === functionName) {
                        const startLine = path.node.loc?.start.line ?? 0;
                        const endLine = path.node.loc?.end.line ?? 0;
                        let callCode = fileContent.split('\n').slice(startLine - 1, endLine).join('\n');
                        functionUsages.push({
                            file: item.path,
                            location: path.node.loc ?? { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }, // Default value if loc is null or undefined
                            callCode: callCode
                        });                        
                    }
                }
            });            
        }
    }

    return functionUsages;
}
