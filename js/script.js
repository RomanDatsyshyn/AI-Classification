window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback, element) {
      window.setTimeout(function() {
        callback(+new Date());
      }, 1000 / 60);
    }
  );
})();

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var perceptron = new Perceptron();
var drawer = new Drawer(ctx);
var pos = { x: 0, y: 0 };
var dim = { width: 0, height: 0 };
var autoTraining = false;
var type = 1;
var points = [];

$(function() {
  // Задаємо розміри системі координат
  dim = {
    width: $(".container").width(), // Погратися з цим
    height: $(window).height() - $("#canvas").offset().top - 30 // Погратися і з оцим
  };

  // функція, яка зчитує точки з канви, нормалізує
  // їхні значення та створює новий об'єкт класа Point
  $("#canvas").click(function(event) {
    var rect = canvas.getBoundingClientRect();

    pos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Нормалізуємо значення;
    pos.x = drawer.normalize(pos.x, 0, dim.width, -1, 1);
    pos.y = drawer.normalize(pos.y, 0, dim.height, 1, -1);

    // Додаємо в масив новий об'єкт класа Point
    points.push(new Point(pos.x, pos.y, type));
  });

  // Обробка подій при натиску на input - #auto-training
  // Якщо натиснуто, то надаємо autoTraining значення True
  $("#auto-training").click(function() {
    autoTraining = $(this).is(":checked");

    if (autoTraining) {
      $(".form-disable").prop("disabled", "disabled");
    } else {
      $(".form-disable").prop("disabled", "");
    }
  });

  // Обробка подій при натиску на button - #circle
  $("#circle").click(function(event) {
    $("#square").removeClass("btn-success");
    $("#square").addClass("btn-outline-success");
    $(this).removeClass("btn-outline-primary");
    $(this).addClass("btn-primary");

    type = 1;
  });

  // Обробка подій при натиску на button - #square
  $("#square").click(function(event) {
    $("#circle").removeClass("btn-primary");
    $("#circle").addClass("btn-outline-primary");
    $(this).removeClass("btn-outline-success");
    $(this).addClass("btn-success");

    type = -1;
  });

  // Обробка подій при натиску на button - #train
  // Запуск функції - train()
  $("#train").click(train);
  startCoordinateSystem();
});

////////////////////////////////////////////////////////////

const train = () => {
  perceptron.reset();
  perceptron.setLearningRate(parseFloat($("#learning-rate").val()));
  perceptron.setMaxIterations(parseInt($("#max-iterations").val()));
  perceptron.trainWithIterations(points);
};

const startCoordinateSystem = () => {
  window.requestAnimationFrame(startCoordinateSystem);

  ctx.canvas.width = dim.width;
  ctx.canvas.height = dim.height;

  // Очищуємо екран
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, dim.width, dim.height);

  // Малюємо систему координат
  drawer.drawAxis();

  // Виставляємо всі точки на площині
  $.each(points, function(index, point) {
    if (point.type == 1) {
      drawer.drawCircle(point);
    } else {
      drawer.drawRectangle(point);
    }
  });

  // Визначаємо координати лінії, яка ділить на класи
  var x1 = -1.0;
  var y1 = perceptron.guessY(x1);

  var x2 = 1.0;
  var y2 = perceptron.guessY(x2);

  // Малюємо цю лінію
  if (perceptron.isReady()) {
    drawer.drawLine(1, x1, y1, x2, y2);
  }

  // Якщо натиснуто на input - #auto-training
  // і autoTraining стало - true
  // встановлюємо значення перцептрону
  // та передаємо всі елементи масиву points в метод - perceptron.train()
  if (autoTraining) {
    perceptron.setLearningRate(parseFloat($("#learning-rate").val()));
    perceptron.setCountIterations(parseInt($("#max-iterations").val()));
    perceptron.setMaxIterations(parseInt($("#max-iterations").val()));
    perceptron.train(points);
  }
};
