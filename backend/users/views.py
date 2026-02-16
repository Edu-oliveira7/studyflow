from django.contrib.auth import authenticate, get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .serializers import MeSerializer

User = get_user_model()


class LoginOrRegisterView(APIView):

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        # Se é login (só username e password)
        if username and password and not email:
            user = authenticate(username=username, password=password)
            
            if not user:
                return Response(
                    {"error": "Nome de usuário ou senha incorretos"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        # Se é registro (username, email e password)
        elif username and email and password:
            # Verifica se usuário já existe
            if User.objects.filter(username=username).exists():
                return Response(
                    {"error": "Nome de usuário já existe"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "Email já cadastrado"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Cria novo usuário
            try:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password
                )
            except Exception as e:
                return Response(
                    {"error": f"Erro ao criar conta: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {"error": "Dados inválidos. Verifique nome de usuário, email e senha"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Gera tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        }, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)
