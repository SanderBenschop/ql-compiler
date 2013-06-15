package org.uva.sea.ql.semanticanalysis;

import org.junit.Before;
import org.junit.Test;
import org.uva.sea.ql.ast.SourceCodeInformation;
import org.uva.sea.ql.ast.expression.primary.Bool;
import org.uva.sea.ql.ast.expression.primary.Int;
import org.uva.sea.ql.ast.statement.IfStatement;
import org.uva.sea.ql.ast.statement.Statement;
import org.uva.sea.ql.semanticanalysis.error.UnsupportedTypeError;

import java.util.Collections;
import java.util.List;

import static junit.framework.Assert.*;

public class ConditionalTypeCheckingVisitorTest {

    private SourceCodeInformation sourceCodeInformation;
    private SemanticAnalyser semanticAnalyser;

    @Before
    public void init() {
        sourceCodeInformation = new SourceCodeInformation(0, 0);
        semanticAnalyser = new SemanticAnalyser();
    }

    @Test
    public void shouldReduceProperly() {
        Bool expression = new Bool(true, sourceCodeInformation);
        List<Statement> emptyStatementList = Collections.emptyList();
        IfStatement conditional = new IfStatement(expression, emptyStatementList);

        boolean ifStatementCorrect = semanticAnalyser.visitIfStatement(conditional);
        assertEquals(0, semanticAnalyser.getErrors().size());
        assertTrue(ifStatementCorrect);
    }

    @Test
    public void shouldDetectTypeError() {
        Int expression = new Int(0, sourceCodeInformation);
        List<Statement> emptyStatementList = Collections.emptyList();
        IfStatement conditional = new IfStatement(expression, emptyStatementList);

        boolean ifStatementCorrect = semanticAnalyser.visitIfStatement(conditional);
        assertEquals(1, semanticAnalyser.getErrors().size());
        assertTrue(semanticAnalyser.getErrors().get(0) instanceof UnsupportedTypeError);
        assertFalse(ifStatementCorrect);
    }
}
