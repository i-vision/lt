<?php

class JsonView extends View {
  var $content = null;
  var $debugKit = null;

  function __construct(&$controller, $register = true) {
    if (is_object($controller) && isset($controller->viewVars['json'])) {
      if (isset($controller->helpers['DebugKit.Toolbar'])) {
        $this->debugKit = $controller->helpers['DebugKit.Toolbar'];
        parent::__construct($controller, $register);
      }
      $this->content = $controller->viewVars['json'];
    }
    if ($register) {
      ClassRegistry::addObject('view', $this);
    }
    Configure::write('debug', 0);
  }

  function render($action = null, $layout = null, $file = null) {
    if ($this->debugKit !== null) {
      DebugKitDebugger::startTimer('viewRender', __d('debug_kit', 'Rendering View', true));
      $this->loaded = $this->_loadHelpers($this->loaded, array('DebugKit.toolbar' => $this->debugKit, 'DebugKit.simpleGraph', 'html', 'number'));
      $this->_triggerHelpers('beforeRender');
    }

    if ($this->content === null) {
      $data = '';
    } else {
      $data = json_encode($this->content);
    }

    if ($this->debugKit !== null) {
      $this->_triggerHelpers('afterRender');

      DebugKitDebugger::stopTimer('viewRender');
      DebugKitDebugger::stopTimer('controllerRender');
      DebugKitDebugger::setMemoryPoint(__d('debug_kit', 'View render complete', true));

      $backend = $this->loaded['toolbar']->getName();
      $this->loaded['toolbar']->{$backend}->send();
    }

    return $data;
  }
}