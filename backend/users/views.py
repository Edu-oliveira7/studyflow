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
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email e senha são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST
            )
        existing_user = User.objects.filter(email=email).first()

        if existing_user:
            user = authenticate(username=existing_user.username, password=password)

            if not user:
                return Response(
                    {"error": "Senha incorreta"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
            }
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)
