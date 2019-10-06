<div class="ring">
	<div></div>
	<div></div>
	<div></div>
	<div></div>
</div>

<style>
  .ring {
    display: inline-block;
    width: 64px;
    height: 64px;
    position: absolute;
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%);
  }
  .ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 51px;
    height: 51px;
    margin: 6px;
    border: 6px solid #eee;
    border-radius: 50%;
    animation: ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #eee transparent transparent transparent;
  }
  .ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>