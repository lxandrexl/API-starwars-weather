Feature: Almacenar consultas en historial

  Scenario: Crear registro válido
    Given un payload válido para almacenar con planetId 5
    When hago POST "/starwars/almacenados"
    Then la respuesta tiene statusCode 200
    And el cuerpo contiene status "created"
    And el detalle incluye un id generado

  Scenario: Error por planetId inválido
    Given un payload inválido para almacenar con planetId 0
    When hago POST "/starwars/almacenados"
    Then la respuesta tiene statusCode 200
    And el cuerpo contiene status "bad_request"
